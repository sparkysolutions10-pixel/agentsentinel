/**
 * AgentSentinel - Unified SorobanSentinel Orchestration Coordinator
 * Orchestrates multi-layered security evaluation across state rent, auth trees,
 * reentrancy, MEV slippage, SEP-41 token transfers, RPC failover, and WASM bytecodes.
 */
import { SentinelEngine } from '../index.js';
import { SentinelRule, ToolCallContext, EvaluationResult } from '../types.js';
export interface SorobanSentinelCoordinatorConfig {
    engine?: SentinelEngine;
    rules?: SentinelRule[];
}
export declare class SorobanSentinelCoordinator {
    private engine;
    constructor(config?: SorobanSentinelCoordinatorConfig);
    getEngine(): SentinelEngine;
    evaluateToolCall(context: ToolCallContext): Promise<EvaluationResult>;
}
//# sourceMappingURL=soroban_sentinel_coordinator.d.ts.map