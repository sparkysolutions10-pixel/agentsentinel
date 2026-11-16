/**
 * AgentSentinel - OFAC SDN Sanctions Address Filter
 * Blocks all transactions interacting with OFAC SDN-listed cryptocurrency addresses
 * to ensure autonomous agent fleets maintain compliance with global AML sanctions.
 */
import { SentinelRule } from '../types.js';
export interface OfacSanctionsConfig {
    customSanctionedAddresses?: string[];
}
export declare function createOfacSanctionsRule(config?: OfacSanctionsConfig): SentinelRule;
//# sourceMappingURL=ofac_sanctions_filter.d.ts.map