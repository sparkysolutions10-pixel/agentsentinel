/**
 * AgentSentinel - Stellar MCP (Model Context Protocol) Tool Call Wrapper
 * Intercepts Model Context Protocol (MCP) tool executions directed towards
 * Stellar Horizon and Soroban RPC tools to guard against prompt injection exploits.
 */
import { Verdict } from '../types.js';
export class StellarMcpSecurityWrapper {
    engine;
    constructor(config) {
        this.engine = config.engine;
    }
    async wrapToolExecution(toolName, toolArgs, executor) {
        const context = {
            id: `mcp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            toolName,
            params: toolArgs,
            timestamp: Date.now()
        };
        const evaluation = await this.engine.evaluate(context);
        if (evaluation.verdict === Verdict.BLOCK || !evaluation.allowed) {
            throw new Error(`[AgentSentinel MCP Guard] Tool "${toolName}" blocked: ${evaluation.violations.map(v => v.reason).join(' | ')}`);
        }
        const finalArgs = evaluation.redactedParams || toolArgs;
        const result = await executor(finalArgs);
        return { result, evaluation };
    }
}
//# sourceMappingURL=stellar_mcp_wrapper.js.map