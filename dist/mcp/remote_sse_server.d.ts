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
export interface GrowthConfig {
    system_name: string;
    version: string;
    target_product: string;
    landing_url: string;
    mcp_sse_url: string;
    pacing_mode: 'STEALTH' | 'BALANCED' | 'HYPER';
    pacing_profiles: Record<string, {
        name: string;
        interval_minutes_min: number;
        interval_minutes_max: number;
        jitter_factor: number;
        max_posts_per_day: number;
        description: string;
    }>;
    utm_parameters: Record<string, string>;
    webhooks: Record<string, string>;
    auto_dispatch_enabled: boolean;
    last_run_timestamp: string | null;
    next_run_timestamp?: string | null;
}
export interface GrowthLedgerItem {
    dispatch_id: string;
    timestamp: string;
    campaign_id: string;
    campaign_title: string;
    confidence_score: number;
    cta_url: string;
    platforms: Record<string, any>;
    merkle_sha256: string;
    webhook_results?: Record<string, any>;
}
export declare class AgentSentinelRemoteSseServer {
    private server;
    private readonly sessions;
    private readonly apiKeys;
    private totalRequestsServed;
    private startTime;
    private readonly persistencePath;
    private globalDailyFreeRequestsCount;
    private lastDailyResetTimestamp;
    private readonly GLOBAL_DAILY_FREE_CAP;
    private readonly processedWebhookEvents;
    private readonly growthAdminSecret;
    private growthTimer;
    private readonly growthEngineDir;
    private readonly growthLedgerPath;
    private readonly growthConfigPath;
    private growthConfig;
    private growthLedger;
    private swarmData;
    constructor();
    /**
     * Loads persisted API keys from disk.
     */
    private loadPersistedKeys;
    /**
     * Persists active customer keys to disk.
     */
    private savePersistedKeys;
    /**
     * Starts the HTTP + SSE remote MCP server.
     */
    start(port?: number, host?: string): Promise<{
        port: number;
        host: string;
    }>;
    /**
     * Stops the HTTP server and terminates all active SSE sessions.
     */
    stop(): Promise<void>;
    /**
     * Generates a new API key with instant auto-activation.
     */
    generateApiKey(email: string, plan?: 'free' | 'pro'): ApiKeyAccount;
    /**
     * Upgrades an existing key to Pro tier instantly upon payment completion.
     * Default validity is 30 days per billing cycle.
     */
    upgradeApiKey(key: string, durationDays?: number): ApiKeyAccount;
    /**
     * Automatically provisions or upgrades an account by email (used by Payment Webhooks).
     */
    upgradeAccountByEmail(email: string, plan?: 'pro' | 'enterprise', durationDays?: number): ApiKeyAccount;
    /**
     * Validates an API key, subscription expiration, and quota limits.
     * Implements Zero-Friction Freemium Law: If token is omitted, auto-routes to Free Guest Tier!
     */
    validateApiKey(token?: string): {
        valid: boolean;
        account?: ApiKeyAccount;
        error?: string;
    };
    /**
     * Helper to determine MIME type by file extension.
     */
    private getMimeType;
    /**
     * Core HTTP Request Router.
     */
    private handleHttpRequest;
    /**
     * Handles opening a persistent SSE stream for an MCP client.
     */
    private handleSseConnection;
    /**
     * Handles incoming JSON-RPC 2.0 requests from MCP clients posted to /messages.
     */
    private handleClientMessage;
    /**
     * Helper to parse JSON body from incoming HTTP request.
     */
    private readJsonBody;
    /**
     * Returns live aggregated server metrics.
     */
    getMetrics(): RemoteServerMetrics;
    /**
     * Returns metadata and health status for API consumers and health probes.
     */
    getServerInfo(): Record<string, unknown>;
    /**
     * Loads growth engine configuration, simulation results, and live dispatch ledger.
     */
    private loadGrowthData;
    /**
     * Persists growth configuration and ledger to disk.
     */
    private saveGrowthData;
    /**
     * Validates admin access for growth dashboard and trigger endpoints.
     */
    private verifyGrowthAdmin;
    /**
     * SentinelPacer: Computes next execution delay with anti-ban Poisson jitter.
     */
    private calculateNextIntervalMinutes;
    /**
     * Initializes the 24/7 background autonomous pacer supervisor loop.
     */
    private initGrowthSupervisor;
    /**
     * Safely posts JSON payload to external webhooks (Discord, Slack, Make/Zapier, etc.).
     */
    private dispatchWebhook;
    /**
     * Executes a single multi-channel marketing campaign cycle.
     */
    triggerGrowthCycle(): Promise<GrowthLedgerItem>;
    /**
     * Renders a Dark Luxury Material 3 authentication prompt for /admin/growth.
     */
    private getAdminAuthPromptHtml;
}
//# sourceMappingURL=remote_sse_server.d.ts.map