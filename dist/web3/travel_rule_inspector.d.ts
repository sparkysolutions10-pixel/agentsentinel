/**
 * AgentSentinel - FATF Travel Rule IVMS 101 Payload Inspector
 * Enforces transmission of originator/beneficiary compliance metadata
 * on transactions exceeding regulatory thresholds.
 */
import { SentinelRule } from '../types.js';
export interface TravelRuleConfig {
    thresholdAmount?: number;
}
export declare function createTravelRuleInspector(config?: TravelRuleConfig): SentinelRule;
//# sourceMappingURL=travel_rule_inspector.d.ts.map