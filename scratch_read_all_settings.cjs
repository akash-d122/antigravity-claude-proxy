const Database = require('better-sqlite3');
const { homedir } = require('os');
const { join } = require('path');

const dbPath = join(homedir(), 'AppData', 'Roaming', 'Antigravity', 'User', 'globalStorage', 'state.vscdb');

const keysToPrint = [
    'antigravityUserSettings.allUserSettings',
    'antigravityUnifiedStateSync.agentPreferences',
    'antigravityUnifiedStateSync.enterprisePreferences',
    'antigravityUnifiedStateSync.modelPreferences',
    'google.antigravity'
];

try {
    const db = new Database(dbPath, { readonly: true });
    for (const key of keysToPrint) {
        const stmt = db.prepare("SELECT value FROM ItemTable WHERE key = ?");
        const row = stmt.get(key);
        if (row && row.value) {
            console.log(`Key: ${key}`);
            const buf = Buffer.from(row.value, 'base64');
            console.log(`Decoded UTF8 (raw): ${row.value}`);
            console.log(`Decoded UTF8 (clean): ${buf.toString('utf8').replace(/[\x00-\x1F\x7F-\x9F]/g, '.')}`);
            console.log("-------------------");
        } else {
            console.log(`Key: ${key} -> Not Found or Empty`);
            console.log("-------------------");
        }
    }
    db.close();
} catch (e) {
    console.error("Error:", e);
}
