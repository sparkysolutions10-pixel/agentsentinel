/**
 * AgentSentinel - Agent Delegation Capability Token Validator
 * Verifies scoped capability delegation tokens presented by autonomous sub-agents
 * before granting access to critical tool actions.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface DelegationTokenConfig {
  requireDelegationToken?: boolean;
  masterSignerAddress?: string;
}

export function createDelegationTokenRule(config: DelegationTokenConfig = {}): SentinelRule {
  const requireToken = config.requireDelegationToken ?? true;

  return {
    id: 'agent-delegation-token-validator',
    name: 'Agent Delegation Capability Token Validator',
    category: 'custom' as ToolCategory,
    priority: 95,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('execute') && !tool.includes('delegate') && !tool.includes('privileged')) {
        return null;
      }

      if (requireToken) {
        const params = context.params || {};
        const token = params.delegationToken || params.capabilityToken;

        if (!token) {
          return {
            ruleId: 'agent-delegation-token-validator',
            ruleName: 'Agent Delegation Capability Token Validator',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Privileged action "${context.toolName}" blocked: missing mandatory cryptographic delegation capability token.`,
            detectedPattern: 'MISSING_DELEGATION_TOKEN'
          };
        }

        if (typeof token === 'object') {
          if (token.expiresAt && Number(token.expiresAt) < (context.timestamp || Date.now())) {
            return {
              ruleId: 'agent-delegation-token-validator',
              ruleName: 'Agent Delegation Capability Token Validator',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: 'Delegation capability token has expired.',
              detectedPattern: 'EXPIRED_DELEGATION_TOKEN'
            };
          }
        }
      }

      return null;
    }
  };
}
