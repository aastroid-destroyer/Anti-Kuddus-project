require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// ─────────────────────────────────────────────────────────────
// GEMINI (Mission 3 — The Syllabus Negotiator)
// The API key lives ONLY here in the backend (.env: GEMINI_API_KEY).
// The frontend never talks to Gemini directly — it calls our routes.
// ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// 'gemini-flash-latest' is an alias that tracks the current free-tier flash
// model, so it won't 404 when a specific version (e.g. 1.5/2.5) gets retired.
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

// ── THE REAL CURRICULUM ──────────────────────────────────────
// The official list of chapters that can actually appear on the exam.
// This is our "source of truth": Gemini keeps a topic ONLY if it matches
// something here, and drops everything else (biography, index, barcode...).
// Edit this list to match your real course.
const CURRICULUM = [
    'Cell Structure and Function',
    'Photosynthesis',
    'Cellular Respiration',
    'Cell Division (Mitosis and Meiosis)',
    'Genetics and Heredity',
    'DNA and Protein Synthesis',
    'Evolution and Natural Selection',
    'Human Physiology',
    'Ecology and Ecosystems',
];

// The instructions we send to Gemini. Edit this freely to change how the
// filtering behaves. The curriculum above is injected in at request time.
// (Phase 3: keep only real exam topics, and explain every keep/drop.)
const FILTER_SYSTEM_PROMPT = `You are a strict study assistant.
You are given (1) the OFFICIAL CURRICULUM of exam chapters, and (2) the messy
raw text of a syllabus that mixes real topics with junk (author biography,
index, barcode, publisher notes, page numbers, etc.).

Your job: go through the distinct topics you find in the syllabus text and
decide, for EACH one, whether it belongs on the exam.

Rules:
- "keep" a topic ONLY if it clearly matches one of the official curriculum
  chapters (a close/synonymous match is fine, exact wording is not required).
- "drop" everything that is not a real curriculum topic (biography, index,
  barcode, acknowledgements, page numbers, prices, and any filler).
- Give a short, plain-language reason for every decision (one sentence).
- For a kept topic, name the curriculum chapter it matched.
- Do not invent topics that are not present in the syllabus text.`;

// ─────────────────────────────────────────────────────────────
// FIREBASE ADMIN INIT  (identity lane — verify tokens ONLY)
// ─────────────────────────────────────────────────────────────
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
    credential: admin.cert(serviceAccount),
});

// ─────────────────────────────────────────────────────────────
// MONGO CONNECTION  (data lane — holds the collections)
// ─────────────────────────────────────────────────────────────
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Filled in once the connection succeeds. Routes read from here.
let complaints;         // { category, description, date }  — NEVER identity
let dailySubmissions;   // { hash }                         — NEVER complaint content
let ledger;             // { type, amount, item, date }     — NEVER identity (Mission 4)
let sos;                // { location, status, date }       — NEVER identity (Mission 5, Option 1)

async function connectDb() {
    await client.connect();
    const db = client.db('benami');
    complaints = db.collection('complaints');
    dailySubmissions = db.collection('dailySubmissions');
    ledger = db.collection('ledger');
    sos = db.collection('sos');
    console.log("Connected to MongoDB (benami db).");
}

// ─────────────────────────────────────────────────────────────
// AUTH MIDDLEWARE  (identity lane — verifies token, nothing else)
// Attaches decoded identity to req.user. Does NOT derive roll,
// does NOT touch complaints. That happens later, in its own function.
// ─────────────────────────────────────────────────────────────
async function verifyToken(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).send({ error: 'Missing bearer token' });
    }

    try {
        const decoded = await getAuth().verifyIdToken(token);
        req.user = { uid: decoded.uid, email: decoded.email };
        next();
    } catch (err) {
        // Log the failure reason only — never the token or a request body.
        console.error('Token verification failed:', err.code || err.message);
        return res.status(401).send({ error: 'Invalid or expired token' });
    }
}

// ─────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send('Benami server running');
});

// Temporary Phase-2 check: proves the middleware works end to end.
// Returns nothing identifying beyond "you are authenticated".
app.get('/me', verifyToken, (req, res) => {
    res.send({ authenticated: true });
});

// List every complaint. Content only, newest first — the collection never
// holds identity, so returning all of it leaks nothing about who filed what.
app.get('/complaints', async (req, res) => {
    try {
        const all = await complaints
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        res.send(all);
    } catch (err) {
        console.error('Failed to load complaints:', err.message);
        res.status(500).send({ error: 'Could not load complaints' });
    }
});

// File an anonymous complaint. Only the report content is stored —
// no token, no identity, nothing that could trace back to the sender.
app.post('/complaints', async (req, res) => {
    const { category, subject, details, createdAt } = req.body || {};

    if (!category || !subject || !details) {
        return res.status(400).send({ error: 'category, subject and details are required' });
    }

    try {
        const result = await complaints.insertOne({
            category,
            subject: subject.trim(),
            details: details.trim(),
            createdAt: createdAt || new Date().toISOString(),
        });
        res.status(201).send({ acknowledged: result.acknowledged, id: result.insertedId });
    } catch (err) {
        console.error('Failed to save complaint:', err.message);
        res.status(500).send({ error: 'Could not save complaint' });
    }
});

// ─────────────────────────────────────────────────────────────
// MISSION 4 — The Corrupt Economy & Tiffin Ledger
// Students anonymously log an extortion event. Exactly like /complaints,
// a ledger entry holds ONLY the event — { type, amount, item, date } —
// and NEVER a roll, uid, name, or IP. The date is stored as YYYY-MM-DD
// (no time) so entries can't be correlated to identify who logged when.
// ─────────────────────────────────────────────────────────────

// Returns today's date as YYYY-MM-DD, dropping the time entirely.
function todayYMD() {
    return new Date().toISOString().slice(0, 10);
}

// Log one anonymous extortion event.
//   payment -> { type: 'payment', amount: 2,  item: null }
//   food    -> { type: 'food',    amount: null, item: '<food name>' }
// We ignore any client-sent date and stamp YYYY-MM-DD on the server, so no
// time (which could fingerprint the sender) ever reaches the database.
app.post('/ledger', async (req, res) => {
    const { type, item } = req.body || {};

    if (type !== 'payment' && type !== 'food') {
        return res.status(400).send({ error: "type must be 'payment' or 'food'" });
    }

    let entry;
    if (type === 'payment') {
        // The washroom toll is always a fixed 2 Taka — set on the server, not trusted from the client.
        entry = { type: 'payment', amount: 2, item: null, date: todayYMD() };
    } else {
        if (!item || !item.trim()) {
            return res.status(400).send({ error: 'item is required for a food entry' });
        }
        entry = { type: 'food', amount: null, item: item.trim(), date: todayYMD() };
    }

    try {
        const result = await ledger.insertOne(entry);
        res.status(201).send({ acknowledged: result.acknowledged, id: result.insertedId });
    } catch (err) {
        console.error('Failed to save ledger entry:', err.message);
        res.status(500).send({ error: 'Could not save ledger entry' });
    }
});

// Aggregate the whole ledger into dashboard numbers:
//   totalTaka      — sum of every payment's amount (each toll is 2 Taka)
//   totalFoodItems — how many food entries were logged
//   foodBreakdown  — [{ item, count }] grouped by food name, most-stolen first
app.get('/ledger/stats', async (req, res) => {
    try {
        const [takaAgg] = await ledger.aggregate([
            { $match: { type: 'payment' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]).toArray();

        const totalFoodItems = await ledger.countDocuments({ type: 'food' });

        const foodBreakdown = await ledger.aggregate([
            { $match: { type: 'food' } },
            { $group: { _id: '$item', count: { $sum: 1 } } },
            { $project: { _id: 0, item: '$_id', count: 1 } },
            { $sort: { count: -1 } },
        ]).toArray();

        res.send({
            totalTaka: takaAgg ? takaAgg.total : 0,
            totalFoodItems,
            foodBreakdown,
        });
    } catch (err) {
        console.error('Failed to load ledger stats:', err.message);
        res.status(500).send({ error: 'Could not load ledger stats' });
    }
});

// ─────────────────────────────────────────────────────────────
// MISSION 5 — SOS Rescue Flare  (Phase 1: POST /sos only)
// A student in danger fires an SOS with their location. Like every other
// mission, an SOS holds ONLY the event — { location, status, date } — and
// NEVER a roll, uid, name, or IP (Option 1: anonymous). The captain-only
// read/resolve routes arrive in Phase 3; Phase 2 adds the captain-only read.
// ─────────────────────────────────────────────────────────────

// THE captains. This list is the ONLY place captain status is decided.
// Whether a user is a captain is judged here in the backend by matching the
// roll from their verified token — NEVER by anything the frontend claims.
// >>> FILL IN the two captain rolls (Biltu, Miltu) as strings, e.g. '21'. <<<
const CAPTAIN_ROLLS = ['2', '3'];

// Pull the roll out of a login email: '21@classb.local' -> '21'.
function rollFromEmail(email) {
    return (email || '').split('@')[0];
}

// True only if this verified user's roll is one of the two captains.
function isCaptain(req) {
    return CAPTAIN_ROLLS.includes(rollFromEmail(req.user.email));
}

// File one SOS. Goes through verifyToken so only authenticated users can post,
// but we deliberately DROP req.user — the token proves "a real student sent
// this", and nothing about who is ever written to the database.
app.post('/sos', verifyToken, async (req, res) => {
    const { location } = req.body || {};

    if (!location || !location.trim()) {
        return res.status(400).send({ error: 'location is required' });
    }

    try {
        // status and date are set on the server, never trusted from the client.
        const result = await sos.insertOne({
            location: location.trim(),
            status: 'active',
            date: todayYMD(),
        });
        res.status(201).send({ acknowledged: result.acknowledged, id: result.insertedId });
    } catch (err) {
        console.error('Failed to save SOS:', err.message);
        res.status(500).send({ error: 'Could not save SOS' });
    }
});

// View active SOS alerts. verifyToken proves who is asking; the captain check
// then gates the DATA: non-captains get 403 and we return BEFORE touching the
// database, so their response never contains a single alert.
app.get('/sos/active', verifyToken, async (req, res) => {
    if (!isCaptain(req)) {
        return res.status(403).send({ error: 'Captains only' });
    }

    try {
        const active = await sos
            .find({ status: 'active' })
            .sort({ _id: -1 })
            .toArray();
        res.send(active);
    } catch (err) {
        console.error('Failed to load active SOS:', err.message);
        res.status(500).send({ error: 'Could not load active SOS' });
    }
});

// Mark one SOS as resolved. Captain-only: the same backend check gates the
// action, so a non-captain can never flip an alert. We validate the id shape
// first (bad id -> 400) and report 404 if no matching SOS exists.
app.patch('/sos/:id/resolve', verifyToken, async (req, res) => {
    if (!isCaptain(req)) {
        return res.status(403).send({ error: 'Captains only' });
    }

    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ error: 'Invalid SOS id' });
    }

    try {
        const result = await sos.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status: 'resolved' } },
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: 'No SOS found with that id' });
        }
        res.send({ acknowledged: result.acknowledged, status: 'resolved' });
    } catch (err) {
        console.error('Failed to resolve SOS:', err.message);
        res.status(500).send({ error: 'Could not resolve SOS' });
    }
});

// The exact JSON shape we force Gemini to return, so we never have to
// guess-parse free text. One object per topic Gemini found in the syllabus.
const FILTER_RESPONSE_SCHEMA = {
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.OBJECT,
        properties: {
            topic: { type: SchemaType.STRING },
            decision: { type: SchemaType.STRING, enum: ['keep', 'drop'] },
            reason: { type: SchemaType.STRING },
        },
        required: ['topic', 'decision', 'reason'],
    },
};

// ─────────────────────────────────────────────────────────────
// MISSION 3 — /summarize
// Takes { text } (raw syllabus), asks Gemini to compare each topic against
// the real CURRICULUM, and returns { items: [{ topic, decision, reason }] }.
// "keep" = a real exam topic, "drop" = junk (biography, index, barcode...).
// ─────────────────────────────────────────────────────────────
app.post('/summarize', async (req, res) => {
    const { text } = req.body || {};

    if (!text || !text.trim()) {
        return res.status(400).send({ error: 'text is required' });
    }

    // Build the full prompt: the rules + the curriculum + the syllabus text.
    const curriculumList = CURRICULUM.map((c) => `- ${c}`).join('\n');
    const prompt =
        `${FILTER_SYSTEM_PROMPT}\n\n` +
        `OFFICIAL CURRICULUM:\n${curriculumList}\n\n` +
        `SYLLABUS TEXT:\n${text}`;

    try {
        const result = await geminiModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            // JSON mode: Gemini must reply with data matching our schema,
            // so result.response.text() is always valid JSON we can parse.
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: FILTER_RESPONSE_SCHEMA,
            },
        });
        const items = JSON.parse(result.response.text());
        res.send({ items });
    } catch (err) {
        // Log the FULL error server-side so we can always see the real cause
        // (status 404 = bad/retired model, 429 = quota, 403 = key/permissions).
        console.error('Gemini summarize failed:', err.status, err.statusText, '-', err.message);

        // Only report a rate limit when it's genuinely a 429 — otherwise the
        // message hides real problems (a retired model, a bad key, etc.).
        if (err.status === 429) {
            return res.status(429).send({ error: 'Rate limit reached. Try again in a moment.' });
        }
        res.status(err.status || 500).send({ error: 'Could not summarize the syllabus' });
    }
});

// ─────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────
connectDb().catch(err => {
    console.error('Mongo connection failed:', err.message);
    process.exit(1);
});

app.listen(port, () => {
    console.log(`Benami server listening on port ${port}`);
});
