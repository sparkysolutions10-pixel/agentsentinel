/**
 * AgentSentinel - Cyclic Tool Dependency & Recursive Call Loop Guard
 * Detects cyclic graphs in agent tool invocation call chains to break
 * infinite recursion loops and runaway agent execution costs.
 */
import { SentinelRule } from '../types.js';
export interface CyclicToolGuardConfig {
    maxCallChainDepth?: number;
}
export declare function createCyclicToolGuardRule(config?: CyclicToolGuardConfig): SentinelRule;
//# sourceMappingURL=cyclic_tool_guard.d.ts.map