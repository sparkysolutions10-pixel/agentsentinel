/**
 * AgentSentinel - Clawback and Frozen Token Flag Detector
 * Inspects Stellar and Soroban asset flags for clawback_enabled and auth_revocable
 * to protect autonomous agents from trading or accepting reversible, high-risk assets.
 */
import { SentinelRule } from '../types.js';
export interface SorobanClawbackConfig {
    blockOnClawbackEnabled?: boolean;
}
export declare function createSorobanClawbackDetectorRule(config?: SorobanClawbackConfig): SentinelRule;
//# sourceMappingURL=soroban_clawback_detector.d.ts.map