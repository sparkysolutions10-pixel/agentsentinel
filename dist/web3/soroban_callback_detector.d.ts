/**
 * AgentSentinel - Recursive Callback Honeypot Detector
 * Detects contracts attempting boomerang callbacks into the invoking agent
 * or wallet address with altered parameters, trapping agents into honeypot drain loops.
 */
import { SentinelRule } from '../types.js';
export interface SorobanCallbackConfig {
    agentAddress?: string;
    disallowSelfCallbacks?: boolean;
}
export declare function createSorobanCallbackDetectorRule(config?: SorobanCallbackConfig): SentinelRule;
//# sourceMappingURL=soroban_callback_detector.d.ts.map