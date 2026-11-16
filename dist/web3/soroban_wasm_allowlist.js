/**
 * AgentSentinel - Contract Bytecode Hash (WASM ID) Allowlist Registry
 * Restricts enterprise autonomous agents to invoking only verified, audited
 * Soroban contract bytecode hashes (WASM IDs).
 */
import { Verdict } from '../types.js';
export function createSorobanWasmAllowlistRule(config) {
    const allowed = new Set((config.allowedWasmHashes || []).map(h => h.toLowerCase()));
    const enforce = config.enforceStrictAllowlist ?? true;
    return {
        id: 'soroban-wasm-allowlist',
        name: 'Soroban WASM Hash Allowlist Registry',
        category: 'custom',
        priority: 95,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('soroban') && !tool.includes('contract') && !tool.includes('invoke')) {
                return null;
            }
            if (!enforce) {
                return null;
            }
            const params = context.params || {};
            const wasmHash = String(params.wasmHash || params.wasmId || params.contractHash || '').toLowerCase().trim();
            if (!wasmHash) {
                return null;
            }
            if (!allowed.has(wasmHash)) {
                return {
                    ruleId: 'soroban-wasm-allowlist',
                    ruleName: 'Soroban WASM Hash Allowlist Registry',
                    severity: 'critical',
                    verdict: Verdict.BLOCK,
                    reason: `Execution blocked: WASM hash "${wasmHash}" is not present in the enterprise audited contract allowlist.`,
                    detectedPattern: `UNAPPROVED_WASM_HASH:${wasmHash}`,
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=soroban_wasm_allowlist.js.map