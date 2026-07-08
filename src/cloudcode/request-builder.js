/**
 * Request Builder for Cloud Code
 *
 * Builds request payloads and headers for the Cloud Code API.
 */

import crypto from 'crypto';
import {
    ANTIGRAVITY_HEADERS,
    ANTIGRAVITY_SYSTEM_INSTRUCTION,
    getModelFamily,
    isThinkingModel,
    DEFAULT_PROJECT_ID
} from '../constants.js';
import { convertAnthropicToGoogle } from '../format/index.js';
import { deriveSessionId } from './session-manager.js';
import { config } from '../config.js';

// Cache of projects where the Cloud Code Private API is disabled
export const disabledProjects = new Set();

/**
 * Build the wrapped request body for Cloud Code API
 *
 * @param {Object} anthropicRequest - The Anthropic-format request
 * @param {string} projectId - The project ID to use
 * @param {string} accountEmail - The account email for session ID derivation
 * @returns {Object} The Cloud Code API request payload
 */
export function buildCloudCodeRequest(anthropicRequest, projectId, accountEmail) {
    const model = anthropicRequest.model;
    const googleRequest = convertAnthropicToGoogle(anthropicRequest);

    // Use stable session ID derived from first user message for cache continuity
    googleRequest.sessionId = deriveSessionId(anthropicRequest, accountEmail);

    // Build system instruction parts — only include actual user system instructions
    // Removed duplicate ANTIGRAVITY_SYSTEM_INSTRUCTION injection that caused identity pollution
    const systemParts = [];

    // Only inject the system instruction if it's non-empty (backward compat)
    if (ANTIGRAVITY_SYSTEM_INSTRUCTION) {
        systemParts.push({ text: ANTIGRAVITY_SYSTEM_INSTRUCTION });
    }

    // Append any existing system instructions from the request
    if (googleRequest.systemInstruction && googleRequest.systemInstruction.parts) {
        for (const part of googleRequest.systemInstruction.parts) {
            if (part.text) {
                systemParts.push({ text: part.text });
            }
        }
    }

    // Ensure at least one system part exists (API requires it)
    if (systemParts.length === 0) {
        systemParts.push({ text: 'You are a helpful AI coding assistant.' });
    }

    const targetProject = (projectId && config.useBillingProject && !disabledProjects.has(projectId)) ? projectId : DEFAULT_PROJECT_ID;

    const payload = {
        project: targetProject,
        model: model,
        request: googleRequest,
        userAgent: 'antigravity',
        requestType: 'agent',  // CLIProxyAPI v6.6.89 compatibility
        requestId: 'agent-' + crypto.randomUUID()
    };

    // Inject systemInstruction with role: "user" at the top level (CLIProxyAPI v6.6.89 behavior)
    payload.request.systemInstruction = {
        role: 'user',
        parts: systemParts
    };

    return payload;
}

/**
 * Build headers for Cloud Code API requests
 *
 * @param {string} token - OAuth access token
 * @param {string} model - Model name
 * @param {string} accept - Accept header value (default: 'application/json')
 * @param {string} [sessionId] - Optional session ID for X-Machine-Session-Id header
 * @returns {Object} Headers object
 */
export function buildHeaders(token, model, accept = 'application/json', sessionId, projectId) {
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...ANTIGRAVITY_HEADERS
    };

    // Add quota/billing project header if provided (enables paid credits/overage support)
    if (projectId && config.useBillingProject && !disabledProjects.has(projectId)) {
        headers['X-Goog-User-Project'] = projectId;
    }

    // Add session ID header if provided (matches Antigravity binary behavior)
    if (sessionId) {
        headers['X-Machine-Session-Id'] = sessionId;
    }

    const modelFamily = getModelFamily(model);

    // Add interleaved thinking header only for Claude thinking models
    if (modelFamily === 'claude' && isThinkingModel(model)) {
        headers['anthropic-beta'] = 'interleaved-thinking-2025-05-14';
    }

    if (accept !== 'application/json') {
        headers['Accept'] = accept;
    }

    return headers;
}
