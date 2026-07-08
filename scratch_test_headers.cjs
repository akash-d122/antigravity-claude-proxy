const assert = require('assert');
const { buildHeaders } = require('./src/cloudcode/request-builder.js');

try {
    const testToken = 'test-token-123';
    const testModel = 'claude-sonnet-4-6';
    const testSession = 'session-987';
    const testProject = 'my-billing-project-id';

    const headers = buildHeaders(testToken, testModel, 'application/json', testSession, testProject);
    
    console.log('Generated Headers:', headers);
    
    assert.strictEqual(headers['Authorization'], 'Bearer test-token-123');
    assert.strictEqual(headers['X-Goog-User-Project'], 'my-billing-project-id');
    assert.strictEqual(headers['X-Machine-Session-Id'], 'session-987');
    
    console.log('✓ Header assertion passed successfully!');
} catch (error) {
    console.error('Test Failed:', error);
    process.exit(1);
}
