import { describe, it, expect } from 'vitest';
import { StakingValidatorSlashingCircuit } from '../src/web3/staking_validator_slashing_circuit.js';

describe('StakingValidatorSlashingCircuit Invariant Suite (#1779)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = StakingValidatorSlashingCircuit.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_STAKING_VALIDATOR_SLASHING_CIRCUIT');
    expect(StakingValidatorSlashingCircuit.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = StakingValidatorSlashingCircuit.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(StakingValidatorSlashingCircuit.validate('git status && npm run test')).toBe(true);
  });
});
