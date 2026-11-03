import { describe, it, expect } from 'vitest';
import { ContractSelfdestructOpcodeBlocker } from '../src/web3/contract_selfdestruct_opcode_blocker.js';

describe('ContractSelfdestructOpcodeBlocker Invariant Suite (#1787)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ContractSelfdestructOpcodeBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CONTRACT_SELFDESTRUCT_OPCODE_BLOCKER');
    expect(ContractSelfdestructOpcodeBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ContractSelfdestructOpcodeBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ContractSelfdestructOpcodeBlocker.validate('git status && npm run test')).toBe(true);
  });
});
