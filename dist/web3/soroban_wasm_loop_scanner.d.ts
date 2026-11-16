/**
 * AgentSentinel - Unbounded Loop and Infinite Recursion Bytecode Scanner
 * Scans WASM control flow structures for infinite loop traps (unbounded loop instructions
 * without conditional exit br_if/br_table) or recursive invocation cycles that exhaust CPU budgets.
 */
import { SentinelRule } from '../types.js';
export interface SorobanWasmLoopScannerConfig {
    maxLoopNestingDepth?: number;
}
export declare function createSorobanWasmLoopScannerRule(config?: SorobanWasmLoopScannerConfig): SentinelRule;
//# sourceMappingURL=soroban_wasm_loop_scanner.d.ts.map