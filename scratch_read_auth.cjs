const Database = require('better-sqlite3');
const { homedir } = require('os');
const { join } = require('path');

const dbPath = join(homedir(), 'AppData', 'Roaming', 'Antigravity', 'User', 'globalStorage', 'state.vscdb');

try {
    const db = new Database(dbPath, { readonly: true });
    const stmt = db.prepare("SELECT value FROM ItemTable WHERE key = 'antigravityAuthStatus'");
    const row = stmt.get();
    if (row && row.value) {
        console.log("antigravityAuthStatus:");
        console.log(JSON.stringify(JSON.parse(row.value), null, 2));
    } else {
        console.log("Not found");
    }
    db.close();
} catch (e) {
    console.error("Error:", e);
}
