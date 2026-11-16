/**
 * AgentSentinel - Cross-Chain Bridge Lock Proof Validator
 * Verifies Merkle leaf inclusion proofs and cryptographic lock receipts
 * before autonomous AI agents can initiate token release or mint transactions.
 */
import { SentinelRule } from '../types.js';
export interface BridgeLockProofConfig {
    requireMerkleProof?: boolean;
    allowedChains?: string[];
}
export declare function createBridgeLockProofRule(config?: BridgeLockProofConfig): SentinelRule;
//# sourceMappingURL=bridge_lock_proof.d.ts.map