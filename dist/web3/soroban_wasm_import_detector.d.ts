/**
 * AgentSentinel - Forbidden WASM Import and Host Function Detector
 * Ensures Soroban smart contract binaries only import authorized host modules ('env' or 'soroban')
 * and intercepts forbidden OS/filesystem imports (e.g. wasi, libc, system).
 */
import { SentinelRule } from '../types.js';
export interface SorobanWasmImportConfig {
    allowedModules?: string[];
}
export declare function createSorobanWasmImportDetectorRule(config?: SorobanWasmImportConfig): SentinelRule;
//# sourceMappingURL=soroban_wasm_import_detector.d.ts.map