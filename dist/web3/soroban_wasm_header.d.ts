/**
 * AgentSentinel - WASM Bytecode Header and Magic Number Validator
 * Inspects installed or deployed WASM contract binaries to verify the standard
 * WebAssembly magic header (\0asm / 0x00 0x61 0x73 0x6d) and version 1.
 */
import { SentinelRule } from '../types.js';
export interface SorobanWasmHeaderConfig {
    requireVersionOne?: boolean;
}
export declare function createSorobanWasmHeaderValidatorRule(config?: SorobanWasmHeaderConfig): SentinelRule;
//# sourceMappingURL=soroban_wasm_header.d.ts.map