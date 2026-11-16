/**
 * AgentSentinel - Agent Delegation Capability Token Validator
 * Verifies scoped capability delegation tokens presented by autonomous sub-agents
 * before granting access to critical tool actions.
 */
import { SentinelRule } from '../types.js';
export interface DelegationTokenConfig {
    requireDelegationToken?: boolean;
    masterSignerAddress?: string;
}
export declare function createDelegationTokenRule(config?: DelegationTokenConfig): SentinelRule;
//# sourceMappingURL=agent_delegation_validator.d.ts.map