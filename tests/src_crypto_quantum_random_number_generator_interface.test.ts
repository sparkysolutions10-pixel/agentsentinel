import { describe, it, expect } from 'vitest';
import { QuantumRandomNumberGeneratorInterface } from '../src/crypto/quantum_random_number_generator_interface.js';

describe('QuantumRandomNumberGeneratorInterface Invariant Suite (#2052)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = QuantumRandomNumberGeneratorInterface.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_QUANTUM_RANDOM_NUMBER_GENERATOR_INTERFACE');
    expect(QuantumRandomNumberGeneratorInterface.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = QuantumRandomNumberGeneratorInterface.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(QuantumRandomNumberGeneratorInterface.validate('git status && npm run test')).toBe(true);
  });
});
