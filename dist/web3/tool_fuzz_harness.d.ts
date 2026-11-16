/**
 * AgentSentinel - Web3 Tool Call Fuzz Harness
 * Generates boundary fuzz vectors (NaN, prototype keys, negative bigints, nulls)
 * to verify rules gracefully evaluate without uncaught runtime exceptions.
 */
import { SentinelRule } from '../types.js';
export interface FuzzReport {
    totalIterations: number;
    crashes: number;
    violationsFound: number;
    passed: boolean;
}
export declare class Web3ToolFuzzHarness {
    static readonly FUZZ_VALUES: any[];
    static fuzzRule(rule: SentinelRule, toolName?: string): FuzzReport;
}
//# sourceMappingURL=tool_fuzz_harness.d.ts.map