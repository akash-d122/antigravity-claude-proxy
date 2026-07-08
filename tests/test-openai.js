async function runTests() {
    console.log("=== Testing OpenAI Chat Completions (Non-Streaming) ===");
    try {
        const response = await fetch('http://localhost:8080/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gemini-3.5-flash-low',
                messages: [{ role: 'user', content: 'hello, please reply with exactly the word SUCCESS' }],
                stream: false
            })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log("Response JSON:");
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Test failed:", e);
    }

    console.log("\n=== Testing OpenAI Chat Completions (Streaming) ===");
    try {
        const response = await fetch('http://localhost:8080/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gemini-3.5-flash-low',
                messages: [{ role: 'user', content: 'hello, count from 1 to 5' }],
                stream: true
            })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        
        // Read response body as text and print SSE lines
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // keep last incomplete line
            for (const line of lines) {
                if (line.trim()) {
                    console.log(line);
                }
            }
        }
        if (buffer.trim()) {
            console.log(buffer);
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

runTests();
