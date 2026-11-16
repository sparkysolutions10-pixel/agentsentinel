/**
 * AgentSentinel - Multi-Signature Threshold and Weight Verification Rule
 * Verifies that the aggregate weight of attached signatures satisfies
 * account threshold requirements before dispatching multi-sig transactions.
 */
import { SentinelRule } from '../types.js';
export interface StellarMultisigConfig {
    requiredThresholdLevel?: 'low' | 'medium' | 'high';
}
export declare function createStellarMultisigVerifierRule(config?: StellarMultisigConfig): SentinelRule;
//# sourceMappingURL=stellar_multisig_verifier.d.ts.map