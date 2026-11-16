/**
 * AgentSentinel - Cryptographic Audit Log Proof Anchor to Stellar Ledger
 * Anchors verifiable SHA-256 state roots and audit decisions onto the Stellar ledger (via transaction memo or contract state)
 * to provide tamper-evident cryptographic proof of AI agent compliance.
 */
import { SentinelRule } from '../types.js';
export interface SorobanAuditAnchorConfig {
    requireCryptographicProof?: boolean;
}
export declare function createSorobanAuditProofAnchorRule(config?: SorobanAuditAnchorConfig): SentinelRule;
//# sourceMappingURL=soroban_audit_anchor.d.ts.map