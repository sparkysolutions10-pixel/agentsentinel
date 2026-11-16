/**
 * AgentSentinel - Bridge Relayer Multisig Signature Guard
 * Enforces cryptographic quorum thresholds (m-of-n) on relayer signatures
 * before autonomous agents accept and execute cross-chain payload messages.
 */
import { SentinelRule } from '../types.js';
export interface BridgeRelayerSignatureConfig {
    threshold?: number;
    authorizedRelayers?: string[];
}
export declare function createBridgeRelayerSignatureRule(config?: BridgeRelayerSignatureConfig): SentinelRule;
//# sourceMappingURL=bridge_relayer_signatures.d.ts.map