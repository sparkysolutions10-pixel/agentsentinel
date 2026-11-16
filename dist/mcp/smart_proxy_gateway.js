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
export class SmartProxyGateway {
    toolCatalog = new Map();
    totalQueries = 0;
    totalTokensSaved = 0;
    estimatedTokensPerSchema = 350;
    /**
     * Registers a tool into the SmartProxy tool catalog.
     */
    registerTool(tool) {
        this.toolCatalog.set(`${tool.serverName}::${tool.name}`, tool);
    }
    /**
     * Registers a batch of tools from an upstream MCP server.
     */
    registerServerTools(serverName, tools) {
        for (const tool of tools) {
            this.registerTool({
                ...tool,
                serverName,
            });
        }
    }
    /**
     * Intelligently routes and reveals ONLY the tools relevant to the prompt intent.
     */
    routeTools(prompt, maxTools = 3) {
        const totalCatalogSize = this.toolCatalog.size;
        const tokensEstimatedWithAll = totalCatalogSize * this.estimatedTokensPerSchema;
        if (totalCatalogSize === 0) {
            return {
                matchedTools: [],
                totalCatalogSize: 0,
                tokensEstimatedWithAll: 0,
                tokensEstimatedRouted: 0,
                tokensSaved: 0,
                savingsPercentage: 0,
            };
        }
        const normalizedPrompt = prompt.toLowerCase();
        const promptTokens = new Set(normalizedPrompt.split(/[\s,._\-:;!?/\\()\[\]{}'"]+/).filter((t) => t.length > 2));
        const scoredTools = [];
        for (const tool of this.toolCatalog.values()) {
            let score = 0;
            // Exact tool name match
            if (normalizedPrompt.includes(tool.name.toLowerCase())) {
                score += 10;
            }
            // Category match
            if (tool.category && normalizedPrompt.includes(tool.category.toLowerCase())) {
                score += 5;
            }
            // Keyword matches
            for (const kw of tool.keywords) {
                const lowerKw = kw.toLowerCase();
                if (promptTokens.has(lowerKw) || normalizedPrompt.includes(lowerKw)) {
                    score += 3;
                }
            }
            // Description token matches
            const descTokens = tool.description.toLowerCase().split(/\s+/);
            for (const dt of descTokens) {
                if (dt.length > 3 && promptTokens.has(dt)) {
                    score += 1;
                }
            }
            scoredTools.push({ tool, score });
        }
        // Sort by descending score
        scoredTools.sort((a, b) => b.score - a.score);
        // Pick top scored tools with score > 0 (or fallback to top 1 if none matched)
        const positiveMatches = scoredTools.filter((st) => st.score > 0);
        const selected = (positiveMatches.length > 0 ? positiveMatches : scoredTools.slice(0, 1))
            .slice(0, maxTools)
            .map((st) => st.tool);
        const tokensEstimatedRouted = selected.length * this.estimatedTokensPerSchema;
        const tokensSaved = Math.max(0, tokensEstimatedWithAll - tokensEstimatedRouted);
        const savingsPercentage = tokensEstimatedWithAll > 0 ? Math.round((tokensSaved / tokensEstimatedWithAll) * 100) : 0;
        this.totalQueries += 1;
        this.totalTokensSaved += tokensSaved;
        return {
            matchedTools: selected,
            totalCatalogSize,
            tokensEstimatedWithAll,
            tokensEstimatedRouted,
            tokensSaved,
            savingsPercentage,
        };
    }
    getMetrics() {
        const servers = new Set();
        for (const t of this.toolCatalog.values()) {
            servers.add(t.serverName);
        }
        const avgSavings = this.totalQueries > 0
            ? Math.round(this.totalTokensSaved / (this.totalQueries * (this.toolCatalog.size || 1) * this.estimatedTokensPerSchema) * 100)
            : 0;
        return {
            totalQueriesRouted: this.totalQueries,
            totalTokensSaved: this.totalTokensSaved,
            registeredToolsCount: this.toolCatalog.size,
            registeredServers: Array.from(servers),
            averageSavingsPercent: Math.min(100, Math.max(0, avgSavings)),
        };
    }
    getCatalog() {
        return Array.from(this.toolCatalog.values());
    }
    clear() {
        this.toolCatalog.clear();
        this.totalQueries = 0;
        this.totalTokensSaved = 0;
    }
}
//# sourceMappingURL=smart_proxy_gateway.js.map