const Database = require('better-sqlite3');
const { homedir } = require('os');
const { join } = require('path');

const dbPath = join(homedir(), 'AppData', 'Roaming', 'Antigravity', 'User', 'globalStorage', 'state.vscdb');

try {
    const db = new Database(dbPath, { readonly: true });
    const stmt = db.prepare("SELECT key FROM ItemTable");
    const rows = stmt.all();
    console.log("All DB keys:");
    for (const row of rows) {
        console.log(row.key);
    }
    db.close();
} catch (e) {
    console.error("Error:", e);
}
