/**
 * AgentSentinel - Linear Memory Page Allocation Ceiling Guard
 * Enforces maximum WASM linear memory limits (default: 64 pages / 4MB, 1 page = 64 KiB)
 * on Soroban smart contract execution to protect against memory exhaustion OOM attacks.
 */
import { SentinelRule } from '../types.js';
export interface SorobanWasmMemoryConfig {
    maxMemoryPages?: number;
}
export declare function createSorobanWasmMemoryGuardRule(config?: SorobanWasmMemoryConfig): SentinelRule;
//# sourceMappingURL=soroban_wasm_memory_guard.d.ts.map