/**
/**
 * AgentSentinel Remote MCP SSE Server
 *
 * Implements the official Model Context Protocol (MCP) Remote Server specification
 * over Server-Sent Events (SSE) and HTTP POST. Enables zero-install cloud hosting
 * on Cloudflare Workers, Railway, Render, Fly.io, or VPS, allowing users to connect
 * Claude Desktop or Cursor directly via a secure cloud URL with instant auto-unlock.
 *
 * @license MIT
 * @author Sparky Solutions (Mukesh Biswas)
 */

import * as http from 'node:http';
import { randomUUID, createHash } from 'node:crypto';
import { AgentSentinelMCPServer, type JSONRPCRequest, type JSONRPCResponse } from './mcp_server.js';

export interface ApiKeyAccount {
  key: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  expiresAt?: number;
  subscriptionStatus?: 'active' | 'expired' | 'canceled';
  quotaLimit: number;
  quotaUsed: number;
  status: 'active' | 'suspended';
}

export interface RemoteServerMetrics {
  uptimeSeconds: number;
  activeSessions: number;
  totalRequestsServed: number;
  registeredKeysCount: number;
  totalTokensSavedEstimate: number;
  globalDailyFreeRequestsCount: number;
  globalDailyFreeCap: number;
}

interface SseClientSession {
  id: string;
  apiKey: string;
  res: http.ServerResponse;
  mcpServer: AgentSentinelMCPServer;
  createdAt: number;
  lastActive: number;
  heartbeatInterval: NodeJS.Timeout;
}

export class AgentSentinelRemoteSseServer {
  private server: http.Server | null = null;
  private readonly sessions: Map<string, SseClientSession> = new Map();
  private readonly apiKeys: Map<string, ApiKeyAccount> = new Map();
  private totalRequestsServed: number = 0;
  private startTime: number = Date.now();

  // 🛡️ Global Server-Wide Free Tier Circuit Breaker (Zero Out-of-Pocket Liability Protection)
  private globalDailyFreeRequestsCount: number = 0;
  private lastDailyResetTimestamp: number = Date.now();
  private readonly GLOBAL_DAILY_FREE_CAP: number = 10_000;

  constructor() {
    // Seed default starter key for instant zero-friction developer testing
    this.apiKeys.set('sk_demo_pixel_2026', {
      key: 'sk_demo_pixel_2026',
      email: 'demo@sparkysolutions.in',
      plan: 'pro',
      createdAt: new Date().toISOString(),
      quotaLimit: 100000,
      quotaUsed: 0,
      status: 'active',
    });
  }

  /**
   * Starts the HTTP + SSE remote MCP server.
   */
  public async start(port: number = 3000, host: string = '0.0.0.0'): Promise<{ port: number; host: string }> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => this.handleHttpRequest(req, res));

      this.server.on('error', (err) => {
        reject(err);
      });

      this.server.listen(port, host, () => {
        const addr = this.server?.address();
        const actualPort = typeof addr === 'object' && addr ? addr.port : port;
        this.startTime = Date.now();
        resolve({ port: actualPort, host });
      });
    });
  }

  /**
   * Stops the HTTP server and terminates all active SSE sessions.
   */
  public async stop(): Promise<void> {
    for (const session of this.sessions.values()) {
      clearInterval(session.heartbeatInterval);
      try {
        session.res.end();
      } catch {
        // ignore
      }
    }
    this.sessions.clear();

    if (this.server) {
      return new Promise((resolve) => {
        this.server?.close(() => {
          this.server = null;
          resolve();
        });
      });
    }
  }

  /**
   * Generates a new API key with instant auto-activation.
   */
  public generateApiKey(email: string, plan: 'free' | 'pro' = 'free'): ApiKeyAccount {
    const prefix = plan === 'pro' ? 'sk_live_' : 'sk_free_';
    const randomHex = createHash('sha256')
      .update(`${email}_${Date.now()}_${Math.random()}`)
      .digest('hex')
      .slice(0, 24);
    const key = `${prefix}${randomHex}`;

    const account: ApiKeyAccount = {
      key,
      email: email.trim().toLowerCase(),
      plan,
      createdAt: new Date().toISOString(),
      quotaLimit: plan === 'pro' ? 1_000_000 : 500,
      quotaUsed: 0,
      status: 'active',
    };

    this.apiKeys.set(key, account);
    return account;
  }

  /**
   * Upgrades an existing key to Pro tier instantly upon payment completion.
   * Default validity is 30 days per billing cycle.
   */
  public upgradeApiKey(key: string, durationDays: number = 30): ApiKeyAccount {
    const existing = this.apiKeys.get(key);
    if (!existing) {
      throw new Error(`API Key not found: ${key}`);
    }

    existing.plan = 'pro';
    existing.quotaLimit = 1_000_000;
    existing.status = 'active';
    existing.subscriptionStatus = 'active';
    existing.expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;
    return existing;
  }

  /**
   * Validates an API key, subscription expiration, and quota limits.
   */
  public validateApiKey(token: string): { valid: boolean; account?: ApiKeyAccount; error?: string } {
    if (!token) {
      return { valid: false, error: 'Missing API key. Provide Authorization: Bearer <key> or ?token=<key>' };
    }

    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    const account = this.apiKeys.get(cleanToken);

    if (!account) {
      return { valid: false, error: 'Invalid API key. Generate a free key at https://agentsentinel.dev' };
    }

    // 🛡️ Subscription Expiry Enforcement: Block expired keys when 30-day billing cycle ends
    if (account.plan !== 'free' && account.expiresAt) {
      if (Date.now() > account.expiresAt) {
        account.status = 'suspended';
        account.subscriptionStatus = 'expired';
        return {
          valid: false,
          error: `Subscription expired on ${new Date(account.expiresAt).toLocaleDateString()}. Please renew at https://sparkysolutions10-pixel.github.io/agentsentinel/ to restore 1,000,000 monthly quota.`,
        };
      }
    }

    if (account.status !== 'active') {
      return { valid: false, error: 'API key is suspended.' };
    }

    if (account.quotaUsed >= account.quotaLimit) {
      return {
        valid: false,
        error: `Monthly quota exceeded (${account.quotaUsed}/${account.quotaLimit}). Upgrade to Pro at https://agentsentinel.dev`,
      };
    }

    // 🛡️ Global Server-Wide Free Pool Protection: Guarantees zero out-of-pocket server bills
    if (account.plan === 'free') {
      const now = Date.now();
      if (now - this.lastDailyResetTimestamp > 24 * 60 * 60 * 1000) {
        this.globalDailyFreeRequestsCount = 0;
        this.lastDailyResetTimestamp = now;
      }
      if (this.globalDailyFreeRequestsCount >= this.GLOBAL_DAILY_FREE_CAP) {
        return {
          valid: false,
          error: `Global daily free community capacity reached (${this.GLOBAL_DAILY_FREE_CAP} calls/day). Upgrade to Pro at https://agentsentinel.dev for dedicated cloud bandwidth or run locally with npx @sparkysolutions/agentsentinel`,
        };
      }
    }

    return { valid: true, account };
  }

  /**
   * Core HTTP Request Router.
   */
  private async handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    // Enable CORS for all incoming clients
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const rawUrl = req.url || '/';
    const parsedUrl = new URL(rawUrl, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // 1. Health & Server Info (Browser redirect on root to live website portal)
    if (pathname === '/') {
      const accept = req.headers.accept || '';
      if (accept.includes('text/html')) {
        res.writeHead(302, { Location: 'https://sparkysolutions10-pixel.github.io/agentsentinel/' });
        res.end();
        return;
      }
    }

    if (pathname === '/' || pathname === '/health' || pathname === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify(
          {
            name: 'AgentSentinel Remote MCP Server',
            version: '0.1.0',
            status: 'HEALTHY_ONLINE',
            protocol: 'Model Context Protocol (JSON-RPC 2.0 over SSE)',
            docs: 'https://github.com/sparkysolutions10-pixel/agentsentinel',
            endpoints: {
              sse: '/sse',
              messages: '/messages',
              generateKey: '/api/keys/generate',
              upgradeKey: '/api/keys/upgrade',
              metrics: '/api/metrics',
            },
            activeSessions: this.sessions.size,
            uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
          },
          null,
          2
        )
      );
      return;
    }

    // 2. Metrics API
    if (pathname === '/api/metrics' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.getMetrics(), null, 2));
      return;
    }

    // 3. API Key Generation Route (Self-Serve Free Key)
    if (pathname === '/api/keys/generate' && req.method === 'POST') {
      try {
        const body = await this.readJsonBody(req);
        const email = String(body.email || `guest_${Date.now()}@agentsentinel.dev`);
        const account = this.generateApiKey(email, 'free');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, account }, null, 2));
      } catch (err: unknown) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      }
      return;
    }

    // 4. API Key Upgrade Route (Pro 1-Click Auto-Unlock)
    if (pathname === '/api/keys/upgrade' && req.method === 'POST') {
      try {
        const body = await this.readJsonBody(req);
        const key = String(body.key || '');
        const updated = this.upgradeApiKey(key);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, account: updated }, null, 2));
      } catch (err: unknown) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      }
      return;
    }

    // 5. SSE Handshake Route (/sse)
    if (pathname === '/sse' && req.method === 'GET') {
      this.handleSseConnection(req, res, parsedUrl);
      return;
    }

    // 6. JSON-RPC Client Messages Route (/messages)
    if (pathname === '/messages' && req.method === 'POST') {
      this.handleClientMessage(req, res, parsedUrl);
      return;
    }

    // Fallback 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Route not found: ${pathname}` }));
  }

  /**
   * Handles opening a persistent SSE stream for an MCP client.
   */
  private handleSseConnection(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    url: URL
  ): void {
    const authHeader = req.headers.authorization;
    const queryToken = url.searchParams.get('token');
    const token = authHeader || queryToken || '';

    const validation = this.validateApiKey(token);
    if (!validation.valid) {
      const statusCode = validation.error?.includes('quota') ? 402 : 401;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: validation.error }));
      return;
    }

    const sessionId = randomUUID();
    const agentIdentifier = `remote-${validation.account?.email || sessionId.slice(0, 8)}`;
    const mcpServer = new AgentSentinelMCPServer(agentIdentifier);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Send initial MCP protocol endpoint announcement event
    const endpointUrl = `/messages?sessionId=${sessionId}`;
    res.write(`event: endpoint\ndata: ${endpointUrl}\n\n`);

    // Setup periodic SSE heartbeat ping (every 15s)
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(`: ping ${Date.now()}\n\n`);
      } catch {
        // stream closed
      }
    }, 15000);

    const session: SseClientSession = {
      id: sessionId,
      apiKey: validation.account!.key,
      res,
      mcpServer,
      createdAt: Date.now(),
      lastActive: Date.now(),
      heartbeatInterval,
    };

    this.sessions.set(sessionId, session);

    req.on('close', () => {
      clearInterval(heartbeatInterval);
      this.sessions.delete(sessionId);
    });
  }

  /**
   * Handles incoming JSON-RPC 2.0 requests from MCP clients posted to /messages.
   */
  private async handleClientMessage(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    url: URL
  ): Promise<void> {
    const sessionId = url.searchParams.get('sessionId') || (req.headers['x-session-id'] as string);

    if (!sessionId || !this.sessions.has(sessionId)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Session not found or expired: ${sessionId}` }));
      return;
    }

    const session = this.sessions.get(sessionId)!;
    session.lastActive = Date.now();

    try {
      const jsonRpcReq = (await this.readJsonBody(req)) as unknown as JSONRPCRequest;

      // Track usage against user account quota
      const account = this.apiKeys.get(session.apiKey);
      if (account) {
        account.quotaUsed += 1;
        if (account.plan === 'free') {
          this.globalDailyFreeRequestsCount += 1;
        }
      }
      this.totalRequestsServed += 1;

      // Dispatch directly to AgentSentinel's native MCP server
      const jsonRpcRes = await session.mcpServer.handleRequest(jsonRpcReq);

      // 1. Emit JSON-RPC response through SSE stream to the client
      session.res.write(`event: message\ndata: ${JSON.stringify(jsonRpcRes)}\n\n`);

      // 2. Also respond HTTP 200/202 to the POST caller with the payload
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(jsonRpcRes));
    } catch (err: unknown) {
      const errorResponse: JSONRPCResponse = {
        jsonrpc: '2.0',
        id: null as unknown as string,
        error: {
          code: -32700,
          message: err instanceof Error ? err.message : 'Invalid JSON received',
        },
      };
      session.res.write(`event: message\ndata: ${JSON.stringify(errorResponse)}\n\n`);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(errorResponse));
    }
  }

  /**
   * Helper to parse JSON body from incoming HTTP request.
   */
  private readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 10 * 1024 * 1024) {
          // 10MB limit guard
          reject(new Error('Payload Too Large'));
        }
      });
      req.on('end', () => {
        if (!body.trim()) {
          resolve({});
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Malformed JSON body'));
        }
      });
      req.on('error', reject);
    });
  }

  /**
   * Returns live aggregated server metrics.
   */
  public getMetrics(): RemoteServerMetrics {
    let estimatedTokensSaved = 0;
    for (const session of this.sessions.values()) {
      estimatedTokensSaved += session.mcpServer.proxy.getMetrics().totalTokensSaved;
    }

    return {
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      activeSessions: this.sessions.size,
      totalRequestsServed: this.totalRequestsServed,
      registeredKeysCount: this.apiKeys.size,
      totalTokensSavedEstimate: estimatedTokensSaved,
      globalDailyFreeRequestsCount: this.globalDailyFreeRequestsCount,
      globalDailyFreeCap: this.GLOBAL_DAILY_FREE_CAP,
    };
  }
}
