const Database = require('better-sqlite3');
const { homedir } = require('os');
const { join } = require('path');

const dbPath = join(homedir(), 'AppData', 'Roaming', 'Antigravity', 'User', 'globalStorage', 'state.vscdb');

try {
    const db = new Database(dbPath, { readonly: true });
    const stmt = db.prepare("SELECT key, value FROM ItemTable WHERE key LIKE '%antigravity%'");
    const rows = stmt.all();
    for (const row of rows) {
        if (!row.value) continue;
        console.log(`Key: ${row.key}`);
        const buf = Buffer.from(row.value, 'base64');
        console.log(`Decoded UTF8: ${buf.toString('utf8').replace(/[\x00-\x1F\x7F-\x9F]/g, '.')}`);
        console.log("-------------------");
    }
    db.close();
} catch (e) {
    console.error("Error:", e);
}
