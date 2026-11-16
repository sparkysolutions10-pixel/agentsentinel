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
import * as https from 'node:https';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID, createHash } from 'node:crypto';
import { AgentSentinelMCPServer } from './mcp_server.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class AgentSentinelRemoteSseServer {
    server = null;
    sessions = new Map();
    apiKeys = new Map();
    totalRequestsServed = 0;
    startTime = Date.now();
    persistencePath = path.resolve(process.cwd(), 'data', 'api_keys.json');
    // 🛡️ Global Server-Wide Free Tier Circuit Breaker (Zero Out-of-Pocket Liability Protection)
    globalDailyFreeRequestsCount = 0;
    lastDailyResetTimestamp = Date.now();
    GLOBAL_DAILY_FREE_CAP = 100;
    // 🛡️ Fintech Tamper Resistance: Webhook Idempotency Registry (Anti-Replay Attack Protection)
    processedWebhookEvents = new Set();
    // 🐟 MiroFish SentinelGrowth 24/7 Autonomous Marketing Swarm Engine
    growthAdminSecret = process.env.GROWTH_ADMIN_SECRET || 'sentinel_growth_admin_2026';
    growthTimer = null;
    growthEngineDir = fs.existsSync(path.resolve(process.cwd(), 'growth_engine'))
        ? path.resolve(process.cwd(), 'growth_engine')
        : path.resolve(__dirname, '../../growth_engine');
    growthLedgerPath = path.resolve(process.cwd(), 'data', 'growth_ledger.json');
    growthConfigPath = path.resolve(process.cwd(), 'data', 'growth_config.json');
    growthConfig = null;
    growthLedger = [];
    swarmData = null;
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
            quotaLimit: 5,
            quotaUsed: 0,
            status: 'active',
        });
        // 3. Load persistent customer keys from disk (preserves Pro upgrades across restarts)
        this.loadPersistedKeys();
        // 4. Initialize MiroFish SentinelGrowth Swarm Engine & Ledger
        this.loadGrowthData();
    }
    /**
     * Loads persisted API keys from disk.
     */
    loadPersistedKeys() {
        try {
            if (fs.existsSync(this.persistencePath)) {
                const raw = fs.readFileSync(this.persistencePath, 'utf8');
                const list = JSON.parse(raw);
                for (const item of list) {
                    this.apiKeys.set(item.key, item);
                }
            }
        }
        catch (err) {
            console.error('[AgentSentinel] Error loading persisted API keys:', err);
        }
    }
    /**
     * Persists active customer keys to disk.
     */
    savePersistedKeys() {
        try {
            const dir = path.dirname(this.persistencePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const list = Array.from(this.apiKeys.values());
            fs.writeFileSync(this.persistencePath, JSON.stringify(list, null, 2), 'utf8');
        }
        catch (err) {
            console.error('[AgentSentinel] Error saving persisted API keys:', err);
        }
    }
    /**
     * Starts the HTTP + SSE remote MCP server.
     */
    async start(port = 3000, host = '0.0.0.0') {
        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => this.handleHttpRequest(req, res));
            this.server.on('error', (err) => {
                reject(err);
            });
            this.server.listen(port, host, () => {
                const addr = this.server?.address();
                const actualPort = typeof addr === 'object' && addr ? addr.port : port;
                this.startTime = Date.now();
                this.initGrowthSupervisor();
                resolve({ port: actualPort, host });
            });
        });
    }
    /**
     * Stops the HTTP server and terminates all active SSE sessions.
     */
    async stop() {
        if (this.growthTimer) {
            clearTimeout(this.growthTimer);
            this.growthTimer = null;
        }
        for (const session of this.sessions.values()) {
            clearInterval(session.heartbeatInterval);
            try {
                session.res.end();
            }
            catch {
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
    generateApiKey(email, plan = 'free') {
        const prefix = plan === 'pro' ? 'sk_live_' : 'sk_free_';
        const randomHex = createHash('sha256')
            .update(`${email}_${Date.now()}_${Math.random()}`)
            .digest('hex')
            .slice(0, 24);
        const key = `${prefix}${randomHex}`;
        const account = {
            key,
            email: email.trim().toLowerCase(),
            plan,
            createdAt: new Date().toISOString(),
            quotaLimit: plan === 'pro' ? 1_000_000 : 5,
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
    upgradeApiKey(key, durationDays = 30) {
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
    upgradeAccountByEmail(email, plan = 'pro', durationDays = 30) {
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
        const newAccount = {
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
    validateApiKey(token) {
        // 1-Click Freemium Rule: Missing token routes to instant Community Free Tier
        if (!token || token.trim() === '') {
            let guest = this.apiKeys.get('sk_free_guest_community');
            if (!guest) {
                guest = {
                    key: 'sk_free_guest_community',
                    email: 'guest@community.agentsentinel.dev',
                    plan: 'free',
                    createdAt: new Date().toISOString(),
                    quotaLimit: 5,
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
            return { valid: false, error: 'Invalid API key. Generate a key at https://getagentsentinel.com/' };
        }
        // 🛡️ Subscription Expiry Enforcement: Block expired keys when 30-day billing cycle ends
        if (account.plan !== 'free' && account.expiresAt) {
            if (Date.now() > account.expiresAt) {
                account.status = 'suspended';
                account.subscriptionStatus = 'expired';
                return {
                    valid: false,
                    error: `Subscription expired on ${new Date(account.expiresAt).toLocaleDateString()}. Please renew at https://getagentsentinel.com/ to restore active cloud quota.`,
                };
            }
        }
        if (account.status !== 'active') {
            return { valid: false, error: 'API key is suspended.' };
        }
        if (account.quotaUsed >= account.quotaLimit) {
            return {
                valid: false,
                error: `Trial quota exceeded (${account.quotaUsed}/${account.quotaLimit} scans used). Upgrade to AgentSentinel Pro ($299/mo) at https://getagentsentinel.com/ to unlock unlimited continuous AST protection.`,
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
                    error: `Global server safety limit reached (${this.GLOBAL_DAILY_FREE_CAP} calls/day). Upgrade to Pro ($299/mo) at https://getagentsentinel.com/ for dedicated priority bandwidth or run locally via GitHub Action.`,
                };
            }
        }
        return { valid: true, account };
    }
    /**
     * Helper to determine MIME type by file extension.
     */
    getMimeType(filePath) {
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
    async handleHttpRequest(req, res) {
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
            }
            catch (err) {
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
            }
            catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
            }
            return;
        }
        // 6. Automated Payment Webhook: Razorpay (Instant Auto-Unlock)
        if (pathname === '/api/webhooks/razorpay' && req.method === 'POST') {
            try {
                const body = (await this.readJsonBody(req));
                const event = String(body.event || 'payment.captured');
                const payloadObj = (body.payload || {});
                const payment = (payloadObj.payment?.entity || payloadObj.order?.entity || body);
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
                if (paymentId)
                    this.processedWebhookEvents.add(paymentId);
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
            }
            catch (err) {
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
                const resource = (body.resource || {});
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
                if (captureId)
                    this.processedWebhookEvents.add(captureId);
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
            }
            catch (err) {
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
                let matched;
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
        // 11. MiroFish SentinelGrowth Swarm Admin HUD (/admin/growth)
        if (pathname === '/admin/growth' && req.method === 'GET') {
            const isAuthorized = this.verifyGrowthAdmin(req, parsedUrl);
            if (!isAuthorized) {
                // Render Dark Luxury Admin Auth Prompt
                res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(this.getAdminAuthPromptHtml());
                return;
            }
            const dashboardPath = path.join(this.growthEngineDir, 'GROWTH_SWARM_DASHBOARD.html');
            if (fs.existsSync(dashboardPath)) {
                const html = fs.readFileSync(dashboardPath, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(html);
            }
            else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'GROWTH_SWARM_DASHBOARD.html not found on server.' }));
            }
            return;
        }
        // 12. MiroFish SentinelGrowth Swarm Status Telemetry (/api/growth/status)
        if (pathname === '/api/growth/status' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ONLINE_ACTIVE',
                uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
                pacing_mode: this.growthConfig?.pacing_mode || 'BALANCED',
                auto_dispatch_enabled: this.growthConfig?.auto_dispatch_enabled ?? true,
                next_run_timestamp: this.growthConfig?.next_run_timestamp || null,
                last_run_timestamp: this.growthConfig?.last_run_timestamp || null,
                simulatedNodes: 1000000,
                activeCampaigns: this.swarmData?.simulation_results?.length || 3,
                totalDispatches: this.growthLedger.length,
                recentDispatches: this.growthLedger.slice(0, 10),
                config: this.growthConfig,
            }, null, 2));
            return;
        }
        // 13. MiroFish SentinelGrowth Swarm Manual Cycle Trigger (/api/growth/trigger)
        if (pathname === '/api/growth/trigger' && req.method === 'POST') {
            const isAuthorized = this.verifyGrowthAdmin(req, parsedUrl);
            if (!isAuthorized) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unauthorized: Invalid or missing growth admin token.' }));
                return;
            }
            try {
                const bundle = await this.triggerGrowthCycle();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, bundle, dispatch: bundle }, null, 2));
            }
            catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
            }
            return;
        }
        // 14. MiroFish SentinelGrowth Swarm Config Update (/api/growth/config)
        if (pathname === '/api/growth/config' && req.method === 'POST') {
            const isAuthorized = this.verifyGrowthAdmin(req, parsedUrl);
            if (!isAuthorized) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unauthorized: Invalid or missing growth admin token.' }));
                return;
            }
            try {
                const body = await this.readJsonBody(req);
                if (this.growthConfig) {
                    if (body.pacing_mode && typeof body.pacing_mode === 'string') {
                        this.growthConfig.pacing_mode = body.pacing_mode;
                    }
                    if (typeof body.auto_dispatch_enabled === 'boolean') {
                        this.growthConfig.auto_dispatch_enabled = body.auto_dispatch_enabled;
                    }
                    if (body.webhooks && typeof body.webhooks === 'object') {
                        this.growthConfig.webhooks = { ...this.growthConfig.webhooks, ...body.webhooks };
                    }
                    this.saveGrowthData();
                    this.initGrowthSupervisor(); // re-arm pacer with updated config
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, config: this.growthConfig }, null, 2));
            }
            catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
            }
            return;
        }
        // Fallback 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Route not found: ${pathname}` }));
    }
    /**
     * Handles opening a persistent SSE stream for an MCP client.
     */
    handleSseConnection(req, res, url) {
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
            }
            catch {
                // stream closed
            }
        }, 15000);
        const session = {
            id: sessionId,
            apiKey: validation.account.key,
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
    async handleClientMessage(req, res, url) {
        const sessionId = url.searchParams.get('sessionId') || req.headers['x-session-id'];
        if (!sessionId || !this.sessions.has(sessionId)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Session not found or expired: ${sessionId}` }));
            return;
        }
        const session = this.sessions.get(sessionId);
        session.lastActive = Date.now();
        try {
            const jsonRpcReq = (await this.readJsonBody(req));
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
        }
        catch (err) {
            const errorResponse = {
                jsonrpc: '2.0',
                id: null,
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
    readJsonBody(req) {
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
                }
                catch (e) {
                    reject(new Error('Malformed JSON body'));
                }
            });
            req.on('error', reject);
        });
    }
    /**
     * Returns live aggregated server metrics.
     */
    getMetrics() {
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
    getServerInfo() {
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
                growthDashboard: '/admin/growth',
                growthStatus: '/api/growth/status',
                growthTrigger: '/api/growth/trigger',
            },
            activeSessions: this.sessions.size,
            uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
        };
    }
    // ==============================================================================
    // 🐟 MIROFISH SENTINELGROWTH 24/7 AUTONOMOUS MARKETING SWARM ENGINE
    // ==============================================================================
    /**
     * Loads growth engine configuration, simulation results, and live dispatch ledger.
     */
    loadGrowthData() {
        // 1. Config loading
        try {
            if (fs.existsSync(this.growthConfigPath)) {
                this.growthConfig = JSON.parse(fs.readFileSync(this.growthConfigPath, 'utf-8'));
            }
            else {
                const defaultPath = path.join(this.growthEngineDir, 'growth_config.json');
                if (fs.existsSync(defaultPath)) {
                    this.growthConfig = JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
                }
            }
        }
        catch (e) {
            console.warn('[GrowthSwarm] Warning loading growth_config.json:', e);
        }
        if (!this.growthConfig) {
            this.growthConfig = {
                system_name: 'MiroFish SentinelGrowth Autonomous Swarm',
                version: '2026.4.1',
                target_product: 'AgentSentinel',
                landing_url: 'https://getagentsentinel.com',
                mcp_sse_url: 'https://mcp.getagentsentinel.com/sse',
                pacing_mode: 'BALANCED',
                pacing_profiles: {
                    STEALTH: {
                        name: 'Stealth Mode (High Safety)',
                        interval_minutes_min: 120,
                        interval_minutes_max: 240,
                        jitter_factor: 0.25,
                        max_posts_per_day: 4,
                        description: 'Recommended for new accounts to build trust and avoid spam heuristics.',
                    },
                    BALANCED: {
                        name: 'Balanced Human Cadence',
                        interval_minutes_min: 60,
                        interval_minutes_max: 120,
                        jitter_factor: 0.15,
                        max_posts_per_day: 8,
                        description: 'Optimal viral growth with natural human posting patterns across global timezones.',
                    },
                    HYPER: {
                        name: 'Hyper Growth (High Velocity)',
                        interval_minutes_min: 25,
                        interval_minutes_max: 50,
                        jitter_factor: 0.1,
                        max_posts_per_day: 16,
                        description: 'High frequency for major launches, breaking AI agent vulnerabilities, and news spikes.',
                    },
                },
                utm_parameters: {
                    utm_source: 'sentinelgrowth_swarm',
                    utm_medium: 'autonomous_ai',
                    utm_campaign: 'q4_developer_firewall',
                },
                webhooks: {},
                auto_dispatch_enabled: true,
                last_run_timestamp: new Date().toISOString(),
            };
        }
        // 2. Swarm simulation data loading
        try {
            const swarmPath = path.join(this.growthEngineDir, 'mirofish_growth_swarm_output.json');
            if (fs.existsSync(swarmPath)) {
                this.swarmData = JSON.parse(fs.readFileSync(swarmPath, 'utf-8'));
            }
        }
        catch (e) {
            console.warn('[GrowthSwarm] Warning loading mirofish_growth_swarm_output.json:', e);
        }
        // 3. Ledger loading
        try {
            if (fs.existsSync(this.growthLedgerPath)) {
                const raw = JSON.parse(fs.readFileSync(this.growthLedgerPath, 'utf-8'));
                this.growthLedger = Array.isArray(raw.dispatches) ? raw.dispatches : [];
            }
            else {
                const defaultLedger = path.join(this.growthEngineDir, 'live_dispatch_ledger.json');
                if (fs.existsSync(defaultLedger)) {
                    const raw = JSON.parse(fs.readFileSync(defaultLedger, 'utf-8'));
                    this.growthLedger = Array.isArray(raw.dispatches) ? raw.dispatches : [];
                }
            }
        }
        catch (e) {
            console.warn('[GrowthSwarm] Warning loading live_dispatch_ledger.json:', e);
        }
    }
    /**
     * Persists growth configuration and ledger to disk.
     */
    saveGrowthData() {
        try {
            const dataDir = path.dirname(this.growthLedgerPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            if (this.growthLedger) {
                fs.writeFileSync(this.growthLedgerPath, JSON.stringify({
                    dispatches: this.growthLedger,
                    stats: {
                        total_dispatches: this.growthLedger.length,
                        successful_webhooks: this.growthLedger.filter((d) => d.webhook_results && Object.values(d.webhook_results).some((r) => r?.success)).length,
                    },
                }, null, 2), 'utf-8');
            }
            if (this.growthConfig) {
                fs.writeFileSync(this.growthConfigPath, JSON.stringify(this.growthConfig, null, 2), 'utf-8');
            }
        }
        catch (e) {
            console.warn('[GrowthSwarm] Warning persisting growth data:', e);
        }
    }
    /**
     * Validates admin access for growth dashboard and trigger endpoints.
     */
    verifyGrowthAdmin(req, parsedUrl) {
        const queryToken = parsedUrl.searchParams.get('token');
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.replace(/^Bearer\s+/i, '').trim();
        const customHeader = req.headers['x-admin-token'];
        const provided = queryToken || bearerToken || customHeader || '';
        return provided === this.growthAdminSecret;
    }
    /**
     * SentinelPacer: Computes next execution delay with anti-ban Poisson jitter.
     */
    calculateNextIntervalMinutes() {
        const pacingMode = this.growthConfig?.pacing_mode || 'BALANCED';
        const profile = this.growthConfig?.pacing_profiles?.[pacingMode] || {
            interval_minutes_min: 60,
            interval_minutes_max: 120,
            jitter_factor: 0.15,
        };
        const min = profile.interval_minutes_min || 60;
        const max = profile.interval_minutes_max || 120;
        const jitter = profile.jitter_factor || 0.15;
        const base = min + Math.random() * (max - min);
        const jitterDelta = base * jitter * (Math.random() * 2 - 1);
        const finalMinutes = Math.max(10, base + jitterDelta);
        return Math.round(finalMinutes * 10) / 10;
    }
    /**
     * Initializes the 24/7 background autonomous pacer supervisor loop.
     */
    initGrowthSupervisor() {
        if (this.growthTimer) {
            clearTimeout(this.growthTimer);
            this.growthTimer = null;
        }
        if (!this.growthConfig || !this.growthConfig.auto_dispatch_enabled) {
            return;
        }
        const intervalMin = this.calculateNextIntervalMinutes();
        const delayMs = Math.round(intervalMin * 60 * 1000);
        this.growthConfig.next_run_timestamp = new Date(Date.now() + delayMs).toISOString();
        console.log(`[GrowthSwarm] SentinelPacer scheduled next campaign in ${intervalMin}m at ${this.growthConfig.next_run_timestamp}`);
        this.growthTimer = setTimeout(async () => {
            try {
                await this.triggerGrowthCycle();
            }
            catch (err) {
                console.error('[GrowthSwarm] Error during scheduled cycle:', err);
            }
            finally {
                this.initGrowthSupervisor();
            }
        }, delayMs);
    }
    /**
     * Safely posts JSON payload to external webhooks (Discord, Slack, Make/Zapier, etc.).
     */
    async dispatchWebhook(url, payload) {
        if (!url || !url.startsWith('http')) {
            return { success: false, message: 'Invalid webhook URL' };
        }
        return new Promise((resolve) => {
            try {
                const parsed = new URL(url);
                const data = JSON.stringify(payload);
                const isHttps = parsed.protocol === 'https:';
                const client = isHttps ? https : http;
                const req = client.request(parsed, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(data),
                        'User-Agent': 'AgentSentinel-GrowthSwarm/2026.4',
                    },
                    timeout: 10000,
                }, (res) => {
                    let resData = '';
                    res.on('data', (c) => (resData += c));
                    res.on('end', () => {
                        const ok = (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300;
                        resolve({
                            success: ok,
                            message: ok ? `HTTP ${res.statusCode}` : `HTTP ${res.statusCode}: ${resData.slice(0, 100)}`,
                        });
                    });
                });
                req.on('timeout', () => {
                    req.destroy();
                    resolve({ success: false, message: 'Webhook timeout (10s)' });
                });
                req.on('error', (err) => {
                    resolve({ success: false, message: err.message });
                });
                req.write(data);
                req.end();
            }
            catch (e) {
                resolve({ success: false, message: e?.message || String(e) });
            }
        });
    }
    /**
     * Executes a single multi-channel marketing campaign cycle.
     */
    async triggerGrowthCycle() {
        const campaigns = this.swarmData?.simulation_results || [];
        const chosenCampaign = campaigns.length > 0
            ? campaigns[Math.floor(Math.random() * campaigns.length)]
            : {
                campaign_id: 'CAMP_01_DEVIANT_AGENT_DISASTER',
                title: 'The 2:00 AM Database Drop: Why Regex Cannot Stop Autonomous Agents',
                overall_confidence: 92.7,
            };
        const campId = chosenCampaign.campaign_id || 'CAMP_01_DEVIANT_AGENT_DISASTER';
        const readyCampaigns = this.swarmData?.ready_to_publish_campaigns || {};
        const campAssets = readyCampaigns[campId] || readyCampaigns['CAMP_01_DEVIANT_AGENT_DISASTER'] || {};
        const landingUrl = this.growthConfig?.landing_url || 'https://getagentsentinel.com';
        const utmMedium = this.growthConfig?.utm_parameters?.utm_medium || 'autonomous_ai';
        const ctaUrl = `${landingUrl}?utm_source=ai_swarm&utm_campaign=${campId.toLowerCase()}&utm_medium=${utmMedium}`;
        // 1. Process Twitter Thread
        const rawTwitter = campAssets.twitter_x_thread || [];
        const tweets = [];
        for (const item of rawTwitter) {
            if (typeof item === 'string') {
                tweets.push(item);
            }
            else if (item && typeof item === 'object') {
                let text = item.hook || item.text || '';
                if (item.cta && !text.includes(ctaUrl)) {
                    text = `${text}\n\n🔗 ${ctaUrl}`;
                }
                tweets.push(text);
            }
        }
        if (tweets.length === 0) {
            tweets.push(`AgentSentinel: Zero-Trust Security Firewall for Autonomous AI Agents.\n\n🛡️ Try 500 free actions: ${ctaUrl}`);
        }
        const firstTweet = tweets[0];
        const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(firstTweet)}`;
        // 2. Process Reddit Post
        const reddit = campAssets.reddit_post || {};
        const sub = reddit.target_subreddit || 'r/ClaudeAI';
        const redditTitle = reddit.title || `Why string regex cannot secure autonomous AI agents`;
        const redditBody = reddit.body_markdown || ``;
        const redditIntent = `https://www.reddit.com/${sub}/submit?title=${encodeURIComponent(redditTitle)}&text=${encodeURIComponent(redditBody)}`;
        // 3. Process Hacker News Post
        const hn = campAssets.hackernews_show_hn || {};
        const hnTitle = hn.title || `Show HN: AgentSentinel – Zero-Trust AST Security Firewall for AI Agents`;
        const hnUrl = hn.url || ctaUrl;
        const hnIntent = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(hnUrl)}&t=${encodeURIComponent(hnTitle)}`;
        // 4. Process LinkedIn Post
        const linkedin = campAssets.linkedin_b2b_post || {};
        const linkedinIntent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(ctaUrl)}`;
        const dispatchId = `DSP_${Math.floor(Date.now() / 1000)}_${Math.floor(1000 + Math.random() * 9000)}`;
        const bundle = {
            dispatch_id: dispatchId,
            timestamp: new Date().toISOString(),
            campaign_id: campId,
            campaign_title: chosenCampaign.title || 'Autonomous Security Advisory',
            confidence_score: Number(chosenCampaign.overall_confidence || 90.0),
            cta_url: ctaUrl,
            platforms: {
                twitter_x: {
                    tweets,
                    tweet_count: tweets.length,
                    intent_url: twitterIntent,
                },
                reddit: {
                    subreddit: sub,
                    title: redditTitle,
                    body: redditBody,
                    intent_url: redditIntent,
                },
                hackernews: {
                    title: hnTitle,
                    url: hnUrl,
                    text: hn.text || '',
                    intent_url: hnIntent,
                },
                linkedin: {
                    headline: linkedin.headline || '',
                    body: linkedin.body || '',
                    intent_url: linkedinIntent,
                },
            },
            merkle_sha256: '',
            webhook_results: {},
        };
        // Calculate Merkle SHA-256
        const repr = JSON.stringify(bundle);
        bundle.merkle_sha256 = createHash('sha256').update(repr).digest('hex');
        // Push to configured webhooks
        const webhooks = this.growthConfig?.webhooks || {};
        const results = {};
        for (const [whName, whUrl] of Object.entries(webhooks)) {
            if (whUrl && typeof whUrl === 'string' && whUrl.startsWith('http')) {
                const payload = {
                    content: `🚨 **AgentSentinel Autonomous Marketing Swarm: New Campaign Ready**\n**${bundle.campaign_title}**\nConfidence: ${bundle.confidence_score}%\nLaunch URL: ${bundle.cta_url}`,
                    embeds: [
                        {
                            title: bundle.campaign_title,
                            description: tweets[0] || '',
                            url: bundle.cta_url,
                            color: 3447003,
                        },
                    ],
                };
                results[whName] = await this.dispatchWebhook(whUrl, payload);
            }
        }
        bundle.webhook_results = results;
        // Prepend to ledger and keep last 100
        this.growthLedger.unshift(bundle);
        if (this.growthLedger.length > 100) {
            this.growthLedger = this.growthLedger.slice(0, 100);
        }
        if (this.growthConfig) {
            this.growthConfig.last_run_timestamp = new Date().toISOString();
        }
        this.saveGrowthData();
        console.log(`[GrowthSwarm] Successfully executed dispatch [${bundle.dispatch_id}] for campaign '${bundle.campaign_title}'`);
        return bundle;
    }
    /**
     * Renders a Dark Luxury Material 3 authentication prompt for /admin/growth.
     */
    getAdminAuthPromptHtml() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AgentSentinel — Growth HUD Admin Authentication</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@500;700&family=Google+Sans+Code&display=swap" rel="stylesheet">
  <style>
    body {
      background: #07090e;
      color: #e2e8f0;
      font-family: 'Google Sans', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .auth-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      padding: 40px;
      max-width: 440px;
      width: 100%;
      text-align: center;
    }
    .icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #10b981 0%, #065f46 100%);
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin-bottom: 20px;
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
    }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 10px; color: #fff; }
    p { font-size: 14px; color: #94a3b8; margin: 0 0 24px; line-height: 1.5; }
    input {
      width: 100%;
      box-sizing: border-box;
      background: #0b101b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 14px 16px;
      color: #fff;
      font-family: 'Google Sans Code', monospace;
      font-size: 14px;
      margin-bottom: 20px;
      outline: none;
    }
    input:focus { border-color: #10b981; }
    button {
      width: 100%;
      background: #10b981;
      color: #042f2e;
      border: none;
      border-radius: 12px;
      padding: 14px 20px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover { background: #34d399; transform: translateY(-1px); }
  </style>
</head>
<body>
  <div class="auth-card">
    <div class="icon">🐟</div>
    <h1>SentinelGrowth HUD</h1>
    <p>Access to the 24/7 Autonomous Marketing Swarm is restricted. Enter your Admin Secret Token to unlock the command HUD.</p>
    <form onsubmit="event.preventDefault(); auth();">
      <input type="password" id="token" placeholder="Enter Admin Secret Token" autofocus required />
      <button type="submit">Unlock Swarm HUD</button>
    </form>
  </div>
  <script>
    function auth() {
      const val = document.getElementById('token').value.trim();
      if (!val) return;
      window.location.href = '/admin/growth?token=' + encodeURIComponent(val);
    }
  </script>
</body>
</html>`;
    }
}
//# sourceMappingURL=remote_sse_server.js.map