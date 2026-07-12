require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require("mongodb");
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

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

async function connectDb() {
    await client.connect();
    const db = client.db('benami');
    complaints = db.collection('complaints');
    dailySubmissions = db.collection('dailySubmissions');
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
// START
// ─────────────────────────────────────────────────────────────
connectDb().catch(err => {
    console.error('Mongo connection failed:', err.message);
    process.exit(1);
});

app.listen(port, () => {
    console.log(`Benami server listening on port ${port}`);
});
