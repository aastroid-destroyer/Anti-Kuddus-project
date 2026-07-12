// ─────────────────────────────────────────────────────────────
// Account seed script.
//
// The app signs in with email/password, where the "email" is
// synthesized on the client as `${roll}@classb.local`. Those
// accounts don't exist until something creates them — this is that
// something. The main server (index.js) only VERIFIES tokens; it
// never creates users, so run this to seed logins.
//
// TWO WAYS TO USE IT:
//
//   ① Whole class at once (recommended for 50 students):
//        Set AUTO_RANGE.enabled = true and set `to` = class size.
//        Passwords are generated automatically and saved to
//        credentials.txt so you can hand them out.
//        Run:  node create-users.js
//
//   ② One student later (someone new joins):
//        Run:  node create-users.js 51 theirPassword
//
// Re-running is safe: existing accounts are skipped, not duplicated
// or overwritten.
// ─────────────────────────────────────────────────────────────
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const crypto = require('crypto');
const fs = require('fs');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({ credential: admin.cert(serviceAccount) });

// Must match Login.jsx (CLASS_DOMAIN).
const CLASS_DOMAIN = 'classb.local';

// ── OPTION ① — auto-generate the whole class ────────────────────
// Turn this on to create rolls `from`..`to` in one shot.
const AUTO_RANGE = { enabled: true, from: 1, to: 50 };

// ── OPTION ①b — or list specific rolls with chosen passwords ────
// Used only when AUTO_RANGE.enabled is false.
const ROLLS = [
    { roll: '23', password: 'abrar-23' },
    { roll: '24', password: 'pritom-24' },
    { roll: '25', password: 'sumaiya-25' },
];

// A short, readable random password (8 chars, letters + digits).
function makePassword() {
    return crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
}

// Returns { email, password, status } so main() can build the report.
async function createOne(roll, password) {
    const email = `${roll}@${CLASS_DOMAIN}`;
    try {
        await getAuth().createUser({ email, password });
        console.log(`  created  ${email}`);
        return { email, password, status: 'created' };
    } catch (err) {
        if (err.code === 'auth/email-already-exists') {
            console.log(`  skipped  ${email}  (already exists)`);
            return { email, password: '(unchanged — already existed)', status: 'skipped' };
        }
        if (err.code === 'auth/operation-not-allowed') {
            console.error(
                `  FAILED   ${email}  — Email/Password sign-in is DISABLED. Enable it: ` +
                `Firebase Console → Authentication → Sign-in method → Email/Password → Enable.`
            );
        } else {
            console.error(`  FAILED   ${email}  — ${err.code || err.message}`);
        }
        return { email, password: '', status: 'failed' };
    }
}

async function main() {
    const [, , cliRoll, cliPassword] = process.argv;
    const results = [];

    if (cliRoll) {
        // ── OPTION ② — single student ──
        if (!cliPassword) {
            console.error('Usage: node create-users.js <roll> <password>');
            process.exit(1);
        }
        console.log('Creating single account:');
        results.push(await createOne(cliRoll, cliPassword));
    } else if (AUTO_RANGE.enabled) {
        // ── OPTION ① — whole class, auto passwords ──
        const { from, to } = AUTO_RANGE;
        console.log(`Creating rolls ${from}..${to} (${to - from + 1} students):`);
        for (let roll = from; roll <= to; roll++) {
            results.push(await createOne(String(roll), makePassword()));
        }
    } else {
        // ── OPTION ①b — explicit list ──
        console.log(`Creating ${ROLLS.length} accounts:`);
        for (const { roll, password } of ROLLS) {
            results.push(await createOne(roll, password));
        }
    }

    // Save a credentials sheet for the newly created accounts so you
    // can distribute passwords. (Skipped/failed rows are noted too.)
    const created = results.filter(r => r.status === 'created');
    if (created.length > 0) {
        const lines = created.map(r => `${r.email}\t${r.password}`).join('\n');
        const header = 'email\tpassword\n';
        fs.writeFileSync('credentials.txt', header + lines + '\n');
        console.log(`\nSaved ${created.length} new logins to credentials.txt`);
    }

    const skipped = results.filter(r => r.status === 'skipped').length;
    const failed = results.filter(r => r.status === 'failed').length;
    console.log(`Done. created=${created.length} skipped=${skipped} failed=${failed}`);
    process.exit(0);
}

main();
