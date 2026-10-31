import { describe, it, expect } from 'vitest';
import { createDelegationTokenRule } from '../src/web3/agent_delegation_validator.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('AgentDelegationTokenValidator', () => {
  const rule = createDelegationTokenRule();

  it('allows privileged execution when accompanied by valid unexpired capability token', () => {
    const context: ToolCallContext = {
      id: 'tx_delegated_valid',
      toolName: 'execute_privileged_payout',
      params: {
        delegationToken: { issuer: 'master_orchestrator', expiresAt: Date.now() + 100000 }
      },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks privileged execution when delegation token is missing', () => {
    const context: ToolCallContext = {
      id: 'tx_delegated_missing',
      toolName: 'execute_privileged_payout',
      params: {},
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toBe('MISSING_DELEGATION_TOKEN');
  });
});
