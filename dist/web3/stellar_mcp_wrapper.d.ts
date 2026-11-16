/**
 * AgentSentinel - Stellar MCP (Model Context Protocol) Tool Call Wrapper
 * Intercepts Model Context Protocol (MCP) tool executions directed towards
 * Stellar Horizon and Soroban RPC tools to guard against prompt injection exploits.
 */
import { SentinelEngine } from '../index.js';
import { EvaluationResult } from '../types.js';
export interface StellarMcpWrapperConfig {
    engine: SentinelEngine;
}
export declare class StellarMcpSecurityWrapper {
    private engine;
    constructor(config: StellarMcpWrapperConfig);
    wrapToolExecution<T>(toolName: string, toolArgs: Record<string, any>, executor: (args: Record<string, any>) => Promise<T>): Promise<{
        result?: T;
        evaluation: EvaluationResult;
    }>;
}
//# sourceMappingURL=stellar_mcp_wrapper.d.ts.map