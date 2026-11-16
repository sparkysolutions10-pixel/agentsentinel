/**
 * AgentSentinel SmartProxy Gateway
 *
 * Solves the severe "Context Window Collapse / Token Bleed" crisis where multiple
 * MCP servers flood the LLM prompt with 50,000+ tokens of static JSON schemas.
 *
 * Dynamically indexes tool catalogs and dynamically exposes ONLY the exact 1-3 tools
 * required for the agent's immediate prompt intent, cutting system prompt token usage
 * by up to 90% while preventing LLM tool-hallucination.
 *
 * @license MIT
 * @author Sparky Solutions (Mukesh Biswas)
 */
export interface MCPToolDefinition {
    name: string;
    description: string;
    serverName: string;
    category: string;
    keywords: string[];
    inputSchema: Record<string, unknown>;
}
export interface RouteResult {
    matchedTools: MCPToolDefinition[];
    totalCatalogSize: number;
    tokensEstimatedWithAll: number;
    tokensEstimatedRouted: number;
    tokensSaved: number;
    savingsPercentage: number;
}
export interface ProxyMetrics {
    totalQueriesRouted: number;
    totalTokensSaved: number;
    registeredToolsCount: number;
    registeredServers: string[];
    averageSavingsPercent: number;
}
export declare class SmartProxyGateway {
    private readonly toolCatalog;
    private totalQueries;
    private totalTokensSaved;
    private readonly estimatedTokensPerSchema;
    /**
     * Registers a tool into the SmartProxy tool catalog.
     */
    registerTool(tool: MCPToolDefinition): void;
    /**
     * Registers a batch of tools from an upstream MCP server.
     */
    registerServerTools(serverName: string, tools: Omit<MCPToolDefinition, 'serverName'>[]): void;
    /**
     * Intelligently routes and reveals ONLY the tools relevant to the prompt intent.
     */
    routeTools(prompt: string, maxTools?: number): RouteResult;
    getMetrics(): ProxyMetrics;
    getCatalog(): MCPToolDefinition[];
    clear(): void;
}
//# sourceMappingURL=smart_proxy_gateway.d.ts.map