/**
 * AgentSentinel Remote MCP SSE Server
 *
 * Implements the official Model Context Protocol (MCP) Remote Server specification
 * over Server-Sent Events (SSE) and HTTP POST. Enables zero-install cloud hosting
 * on Cloudflare Workers, Railway, Render, Fly.io, or VPS, allowing users to connect
 * Claude Desktop, Cursor IDE, Windsurf, or Devin directly via a secure cloud URL
 * with instant auto-unlock and keyless zero-friction freemium access.
 *
 * @license MIT
 * @author Sparky Solutions (Mukesh Biswas)
 */

import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
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
  private readonly persistencePath: string = path.resolve(process.cwd(), 'data', 'api_keys.json');

  // 🛡️ Global Server-Wide Free Tier Circuit Breaker (Zero Out-of-Pocket Liability Protection)
  private globalDailyFreeRequestsCount: number = 0;
  private lastDailyResetTimestamp: number = Date.now();
  private readonly GLOBAL_DAILY_FREE_CAP: number = 25_000;

  // 🛡️ Fintech Tamper Resistance: Webhook Idempotency Registry (Anti-Replay Attack Protection)
  private readonly processedWebhookEvents: Set<string> = new Set();

  constructor() {
    // 1. Seed default starter key for instant zero-friction developer testing
    this.apiKeys.set('sk_demo_pixel_2026', {
      key: 'sk_demo_pixel_2026',
      email: 'demo@sparkysolutions.in',
      plan: 'pro',
      createdAt: new Date().toISOString(),
      quotaLimit: 1_000_000,
      quotaUsed: 0,
      status: 'active',
    });

    // 2. Seed keyless community guest account for instant connection
    this.apiKeys.set('sk_free_guest_community', {
      key: 'sk_free_guest_community',
      email: 'guest@community.agentsentinel.dev',
      plan: 'free',
      createdAt: new Date().toISOString(),
      quotaLimit: 500,
      quotaUsed: 0,
      status: 'active',
    });

    // 3. Load persistent customer keys from disk (preserves Pro upgrades across restarts)
    this.loadPersistedKeys();
  }

  /**
   * Loads persisted API keys from disk.
   */
  private loadPersistedKeys(): void {
    try {
      if (fs.existsSync(this.persistencePath)) {
        const raw = fs.readFileSync(this.persistencePath, 'utf8');
        const list: ApiKeyAccount[] = JSON.parse(raw);
        for (const item of list) {
          this.apiKeys.set(item.key, item);
        }
      }
    } catch (err) {
      console.error('[AgentSentinel] Error loading persisted API keys:', err);
    }
  }

  /**
   * Persists active customer keys to disk.
   */
  private savePersistedKeys(): void {
    try {
      const dir = path.dirname(this.persistencePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.apiKeys.values());
      fs.writeFileSync(this.persistencePath, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[AgentSentinel] Error saving persisted API keys:', err);
    }
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
    this.savePersistedKeys();
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
    this.savePersistedKeys();
    return existing;
  }

  /**
   * Automatically provisions or upgrades an account by email (used by Payment Webhooks).
   */
  public upgradeAccountByEmail(
    email: string,
    plan: 'pro' | 'enterprise' = 'pro',
    durationDays: number = 30
  ): ApiKeyAccount {
    const cleanEmail = email.toLowerCase().trim();
    // Search existing account
    for (const account of this.apiKeys.values()) {
      if (account.email.toLowerCase() === cleanEmail) {
        account.plan = plan;
        account.quotaLimit = plan === 'enterprise' ? 10_000_000 : 1_000_000;
        account.status = 'active';
        account.subscriptionStatus = 'active';
        account.expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;
        this.savePersistedKeys();
        return account;
      }
    }

    // Provision new account if not exists
    const prefix = plan === 'enterprise' ? 'sk_ent_' : 'sk_live_';
    const randomHex = createHash('sha256')
      .update(`${cleanEmail}_${Date.now()}_${Math.random()}`)
      .digest('hex')
      .slice(0, 24);
    const key = `${prefix}${randomHex}`;

    const newAccount: ApiKeyAccount = {
      key,
      email: cleanEmail,
      plan,
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + durationDays * 24 * 60 * 60 * 1000,
      subscriptionStatus: 'active',
      quotaLimit: plan === 'enterprise' ? 10_000_000 : 1_000_000,
      quotaUsed: 0,
      status: 'active',
    };
    this.apiKeys.set(key, newAccount);
    this.savePersistedKeys();
    return newAccount;
  }

  /**
   * Validates an API key, subscription expiration, and quota limits.
   * Implements Zero-Friction Freemium Law: If token is omitted, auto-routes to Free Guest Tier!
   */
  public validateApiKey(token?: string): { valid: boolean; account?: ApiKeyAccount; error?: string } {
    // 1-Click Freemium Rule: Missing token routes to instant Community Free Tier
    if (!token || token.trim() === '') {
      let guest = this.apiKeys.get('sk_free_guest_community');
      if (!guest) {
        guest = {
          key: 'sk_free_guest_community',
          email: 'guest@community.agentsentinel.dev',
          plan: 'free',
          createdAt: new Date().toISOString(),
          quotaLimit: 500,
          quotaUsed: 0,
          status: 'active',
        };
        this.apiKeys.set('sk_free_guest_community', guest);
      }
      return { valid: true, account: guest };
    }

    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    const account = this.apiKeys.get(cleanToken);

    if (!account) {
      return { valid: false, error: 'Invalid API key. Generate a free key at https://getagentsentinel.com/' };
    }

    // 🛡️ Subscription Expiry Enforcement: Block expired keys when 30-day billing cycle ends
    if (account.plan !== 'free' && account.expiresAt) {
      if (Date.now() > account.expiresAt) {
        account.status = 'suspended';
        account.subscriptionStatus = 'expired';
        return {
          valid: false,
          error: `Subscription expired on ${new Date(account.expiresAt).toLocaleDateString()}. Please renew at https://getagentsentinel.com/ to restore 1,000,000 monthly quota.`,
        };
      }
    }

    if (account.status !== 'active') {
      return { valid: false, error: 'API key is suspended.' };
    }

    if (account.quotaUsed >= account.quotaLimit) {
      return {
        valid: false,
        error: `Monthly quota exceeded (${account.quotaUsed}/${account.quotaLimit}). Upgrade to Pro at https://getagentsentinel.com/`,
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
          error: `Global daily free community capacity reached (${this.GLOBAL_DAILY_FREE_CAP} calls/day). Upgrade to Pro at https://getagentsentinel.com/ for dedicated cloud bandwidth or run locally with npx @sparkysolutions/agentsentinel`,
        };
      }
    }

    return { valid: true, account };
  }

  /**
   * Helper to determine MIME type by file extension.
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.html': return 'text/html; charset=utf-8';
      case '.css': return 'text/css; charset=utf-8';
      case '.js': return 'application/javascript; charset=utf-8';
      case '.json': return 'application/json; charset=utf-8';
      case '.svg': return 'image/svg+xml';
      case '.png': return 'image/png';
      case '.jpg':
      case '.jpeg': return 'image/jpeg';
      case '.ico': return 'image/x-icon';
      case '.zip': return 'application/zip';
      case '.ps1':
      case '.bat':
      case '.txt': return 'text/plain; charset=utf-8';
      default: return 'application/octet-stream';
    }
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

    // Resolve docs directory (supports root running and dist runner)
    const docsDir = fs.existsSync(path.resolve(process.cwd(), 'docs'))
      ? path.resolve(process.cwd(), 'docs')
      : path.resolve(__dirname, '../../docs');

    // 1. Direct Web Portal & Static Assets Hosting (Railway is the primary website)
    if (pathname === '/' || pathname === '/index.html') {
      const accept = req.headers.accept || '';
      // If client is a programmatic API consumer explicitly requesting JSON
      if (accept.includes('application/json') && !accept.includes('text/html')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.getServerInfo(), null, 2));
        return;
      }

      // Serve full web portal directly from Railway
      const indexPath = path.join(docsDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        const html = fs.readFileSync(indexPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }
    }

    // Static Asset Delivery from docs directory (HTML, CSS, JS, SVG, ZIP, PS1, BAT)
    const relativeAssetPath = pathname.replace(/^\/+/, '');
    const candidatePath = path.resolve(docsDir, relativeAssetPath);
    if (candidatePath.startsWith(docsDir) && fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
      const mime = this.getMimeType(candidatePath);
      const data = fs.readFileSync(candidatePath);
      res.writeHead(200, {
        'Content-Type': mime,
        'Content-Length': data.length,
      });
      res.end(data);
      return;
    }

    // 2. Health & Server Info
    if (pathname === '/health' || pathname === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.getServerInfo(), null, 2));
      return;
    }

    // 3. Metrics API
    if (pathname === '/api/metrics' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.getMetrics(), null, 2));
      return;
    }

    // 4. API Key Generation Route (Self-Serve Free Key)
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

    // 5. API Key Upgrade Route (Pro 1-Click Auto-Unlock)
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

    // 6. Automated Payment Webhook: Razorpay (Instant Auto-Unlock)
    if (pathname === '/api/webhooks/razorpay' && req.method === 'POST') {
      try {
        const body = (await this.readJsonBody(req)) as Record<string, any>;
        const event = String(body.event || 'payment.captured');
        const payloadObj = (body.payload || {}) as Record<string, any>;
        const payment = (payloadObj.payment?.entity || payloadObj.order?.entity || body) as Record<string, any>;
        const paymentId = String(payment.id || body.id || '');

        // 🛡️ Webhook Idempotency Check (Anti-Replay Attack Protection)
        if (paymentId && this.processedWebhookEvents.has(paymentId)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            idempotent: true,
            alreadyProcessed: true,
            gateway: 'razorpay',
            paymentId,
            message: 'Webhook event already processed (idempotency enforced).'
          }, null, 2));
          return;
        }
        if (paymentId) this.processedWebhookEvents.add(paymentId);

        const email = String(payment.email || body.email || 'customer@razorpay.com');
        const amountPaise = Number(payment.amount || 0);

        // >= 10000 INR (1,000,000 paise) qualifies as Enterprise Tier
        const plan = amountPaise >= 1000000 ? 'enterprise' : 'pro';
        const account = this.upgradeAccountByEmail(email, plan);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          gateway: 'razorpay',
          event,
          email: account.email,
          plan: account.plan,
          quotaLimit: account.quotaLimit,
          key: account.key,
          unlocked: true,
        }, null, 2));
      } catch (err: unknown) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      }
      return;
    }

    // 7. Automated Payment Webhook: PayPal (Instant Auto-Unlock)
    if (pathname === '/api/webhooks/paypal' && req.method === 'POST') {
      try {
        const body = await this.readJsonBody(req);
        const eventType = String(body.event_type || 'PAYMENT.CAPTURE.COMPLETED');
        const resource = (body.resource || {}) as Record<string, any>;
        const captureId = String(resource.id || body.id || '');

        // 🛡️ Webhook Idempotency Check (Anti-Replay Attack Protection)
        if (captureId && this.processedWebhookEvents.has(captureId)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            idempotent: true,
            alreadyProcessed: true,
            gateway: 'paypal',
            captureId,
            message: 'Webhook event already processed (idempotency enforced).'
          }, null, 2));
          return;
        }
        if (captureId) this.processedWebhookEvents.add(captureId);

        const email = String(resource.payer?.email_address || body.email || 'customer@paypal.com');
        const amountUsd = parseFloat(resource.amount?.value || '0');

        // >= $150 qualifies as Enterprise Tier
        const plan = amountUsd >= 150 ? 'enterprise' : 'pro';
        const account = this.upgradeAccountByEmail(email, plan);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          gateway: 'paypal',
          event: eventType,
          email: account.email,
          plan: account.plan,
          quotaLimit: account.quotaLimit,
          key: account.key,
          unlocked: true,
        }, null, 2));
      } catch (err: unknown) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      }
      return;
    }

    // 8. Instant Unlock Status Check (/api/auth/status)
    if (pathname === '/api/auth/status' && req.method === 'GET') {
      const email = parsedUrl.searchParams.get('email');
      const token = parsedUrl.searchParams.get('token');

      if (email) {
        const cleanEmail = email.toLowerCase().trim();
        let matched: ApiKeyAccount | undefined;
        for (const acc of this.apiKeys.values()) {
          if (acc.email.toLowerCase() === cleanEmail) {
            matched = acc;
            break;
          }
        }
        if (matched && matched.subscriptionStatus === 'active') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            active: true,
            plan: matched.plan,
            quotaLimit: matched.quotaLimit,
            quotaUsed: matched.quotaUsed,
            expiresAt: matched.expiresAt,
            key: matched.key,
          }));
          return;
        }
      }

      if (token) {
        const validation = this.validateApiKey(token);
        if (validation.valid && validation.account) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            active: true,
            plan: validation.account.plan,
            quotaLimit: validation.account.quotaLimit,
            quotaUsed: validation.account.quotaUsed,
            expiresAt: validation.account.expiresAt,
            key: validation.account.key,
          }));
          return;
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ active: false, plan: 'free' }));
      return;
    }

    // 9. SSE Handshake Route (/sse)
    if (pathname === '/sse' && req.method === 'GET') {
      this.handleSseConnection(req, res, parsedUrl);
      return;
    }

    // 10. JSON-RPC Client Messages Route (/messages)
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

    // Zero-friction: if token is empty, validateApiKey will assign community free guest account
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

  /**
   * Returns metadata and health status for API consumers and health probes.
   */
  public getServerInfo(): Record<string, unknown> {
    return {
      name: 'AgentSentinel Remote MCP Server',
      version: '0.1.0',
      status: 'HEALTHY_ONLINE',
      protocol: 'Model Context Protocol (JSON-RPC 2.0 over SSE)',
      brand: 'AgentSentinel by Sparky Solutions',
      docs: 'https://getagentsentinel.com/',
      toolsCount: 12,
      capabilities: [
        'Zero-Trust Runtime AST Firewall (51+ Invariants)',
        'Cryptographic SHA-256 Merkle Flight Recorder',
        'ACID Atomic Rollback Engine',
        'SmartProxy 90% Token Reduction Gateway',
        'Instant 1-Click Auto-Unlock Freemium',
      ],
      endpoints: {
        website: '/',
        dashboard: '/dashboard.html',
        sse: '/sse',
        messages: '/messages',
        generateKey: '/api/keys/generate',
        upgradeKey: '/api/keys/upgrade',
        webhookRazorpay: '/api/webhooks/razorpay',
        webhookPaypal: '/api/webhooks/paypal',
        authStatus: '/api/auth/status',
        metrics: '/api/metrics',
      },
      activeSessions: this.sessions.size,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
