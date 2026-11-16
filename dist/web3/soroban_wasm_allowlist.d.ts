/**
 * AgentSentinel - Contract Bytecode Hash (WASM ID) Allowlist Registry
 * Restricts enterprise autonomous agents to invoking only verified, audited
 * Soroban contract bytecode hashes (WASM IDs).
 */
import { SentinelRule } from '../types.js';
export interface SorobanWasmAllowlistConfig {
    allowedWasmHashes: string[];
    enforceStrictAllowlist?: boolean;
}
export declare function createSorobanWasmAllowlistRule(config: SorobanWasmAllowlistConfig): SentinelRule;
//# sourceMappingURL=soroban_wasm_allowlist.d.ts.map