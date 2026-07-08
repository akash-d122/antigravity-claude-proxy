const fs = require('fs');

const asarPath = 'C:\\Users\\akash\\AppData\\Local\\Programs\\antigravity\\resources\\app.asar';

try {
    const data = fs.readFileSync(asarPath);
    console.log("Read app.asar size:", data.length);
    
    // Convert to lowercase string to search case insensitively
    const dataStr = data.toString('utf8');
    const dataLower = dataStr.toLowerCase();
    
    const keywords = ['credit', 'overage', 'billing', 'paid', 'allow_paid', 'allowpaid', 'usecredits', 'use_credits'];
    for (const kw of keywords) {
        let index = 0;
        let count = 0;
        while ((index = dataLower.indexOf(kw, index)) !== -1) {
            count++;
            const start = Math.max(0, index - 60);
            const end = Math.min(data.length, index + kw.length + 60);
            const context = dataStr.substring(start, end).replace(/[\x00-\x1F\x7F-\x9F\r\n]/g, ' ');
            console.log(`Keyword: "${kw}" found at ${index} context: ${context}`);
            index += kw.length;
            if (count > 20) {
                console.log(`Too many occurrences of "${kw}", clipping...`);
                break;
            }
        }
    }
} catch (e) {
    console.error("Error:", e);
}
