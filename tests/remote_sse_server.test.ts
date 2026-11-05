import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AgentSentinelRemoteSseServer } from '../src/mcp/remote_sse_server.js';
import * as http from 'node:http';

describe('AgentSentinelRemoteSseServer', () => {
  let sseServer: AgentSentinelRemoteSseServer;
  let serverPort: number;
  let baseUrl: string;

  beforeAll(async () => {
    sseServer = new AgentSentinelRemoteSseServer();
    // Port 0 picks an available random ephemeral port
    const info = await sseServer.start(0, '127.0.0.1');
    serverPort = info.port;
    baseUrl = `http://127.0.0.1:${serverPort}`;
  });

  afterAll(async () => {
    await sseServer.stop();
  });

  it('should respond to /health with status 200 and online metadata', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('HEALTHY_ONLINE');
    expect(data.name).toBe('AgentSentinel Remote MCP Server');
    expect(data.endpoints.sse).toBe('/sse');
  });

  it('should generate free API keys via /api/keys/generate', async () => {
    const res = await fetch(`${baseUrl}/api/keys/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'developer@example.com' }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.account.key).toMatch(/^sk_free_/);
    expect(data.account.plan).toBe('free');
    expect(data.account.quotaLimit).toBe(500);
  });

  it('should upgrade an existing key via /api/keys/upgrade', async () => {
    // Generate key
    const genRes = await fetch(`${baseUrl}/api/keys/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pro_user@example.com' }),
    });
    const genData = await genRes.json();
    const freeKey = genData.account.key;

    // Upgrade key
    const upRes = await fetch(`${baseUrl}/api/keys/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: freeKey }),
    });

    expect(upRes.status).toBe(200);
    const upData = await upRes.json();
    expect(upData.account.plan).toBe('pro');
    expect(upData.account.quotaLimit).toBe(1_000_000);
  });

  it('should reject /sse connection with invalid key', async () => {
    const res = await fetch(`${baseUrl}/sse?token=sk_invalid_token_999`);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('Invalid API key');
  });

  it('should establish SSE connection with valid key and handle JSON-RPC messages', async () => {
    // Connect to /sse using demo key
    const controller = new AbortController();
    const sseResponse = await fetch(`${baseUrl}/sse?token=sk_demo_pixel_2026`, {
      signal: controller.signal,
      headers: { Accept: 'text/event-stream' },
    });

    expect(sseResponse.status).toBe(200);
    expect(sseResponse.headers.get('content-type')).toContain('text/event-stream');

    const reader = sseResponse.body!.getReader();
    const decoder = new TextDecoder();

    // Read the first chunk containing the 'endpoint' event
    const { value } = await reader.read();
    const chunkText = decoder.decode(value);
    expect(chunkText).toContain('event: endpoint');

    // Extract the /messages?sessionId=... URL
    const match = chunkText.match(/\/messages\?sessionId=([a-f0-9\-]+)/);
    expect(match).not.toBeNull();
    const sessionId = match![1];

    // Post an MCP JSON-RPC 'initialize' call to /messages
    const postRes = await fetch(`${baseUrl}/messages?sessionId=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 101,
        method: 'initialize',
        params: {},
      }),
    });

    expect(postRes.status).toBe(200);
    const postData = await postRes.json();
    expect(postData.id).toBe(101);
    expect(postData.result.serverInfo.name).toBe('agentsentinel');

    // Abort SSE stream to cleanly disconnect
    controller.abort();
  });
});
