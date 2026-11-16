/**
 * AgentSentinel - Ed25519 Signature Malleability Scrubber
 * Enforces canonical scalar bounds (0 <= S < L) on Ed25519 signatures
 * to prevent transaction hash mutation and replay vulnerabilities.
 */
import { SentinelRule } from '../types.js';
export interface Ed25519MalleabilityConfig {
    strictCanonicalOnly?: boolean;
}
export declare function createEd25519MalleabilityRule(config?: Ed25519MalleabilityConfig): SentinelRule;
//# sourceMappingURL=ed25519_malleability_scrubber.d.ts.map