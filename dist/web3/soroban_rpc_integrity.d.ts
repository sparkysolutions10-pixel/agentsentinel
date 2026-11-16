/**
 * AgentSentinel - JSON-RPC Response Signature and Hash Integrity Verifier
 * Verifies RPC response state hashes and signatures to detect malicious MITM proxies
 * or tampered ledger state responses from compromised RPC endpoints.
 */
import { SentinelRule } from '../types.js';
export interface SorobanRpcIntegrityConfig {
    enforceStateHash?: boolean;
}
export declare function createSorobanRpcIntegrityVerifierRule(config?: SorobanRpcIntegrityConfig): SentinelRule;
//# sourceMappingURL=soroban_rpc_integrity.d.ts.map