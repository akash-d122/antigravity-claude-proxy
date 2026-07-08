const fs = require('fs');
const path = require('path');

const configPath = path.join(require('os').homedir(), '.config', 'antigravity-proxy', 'accounts.json');
try {
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    console.log("Active Index:", config.activeIndex);
    console.log("Accounts:");
    config.accounts.forEach(acc => {
        console.log(`- Email: ${acc.email}`);
        console.log(`  Source: ${acc.source}`);
        console.log(`  Project ID: ${acc.projectId}`);
        console.log(`  Subscription Project ID: ${acc.subscription?.projectId}`);
        console.log(`  Refresh Token Parts:`, acc.refreshToken ? require('./src/auth/oauth.js').parseRefreshParts(acc.refreshToken) : 'N/A');
    });
} catch (e) {
    console.error("Error reading config:", e);
}
