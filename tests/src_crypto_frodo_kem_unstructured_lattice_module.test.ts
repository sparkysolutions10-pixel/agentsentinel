import { describe, it, expect } from 'vitest';
import { FrodoKemUnstructuredLatticeModule } from '../src/crypto/frodo_kem_unstructured_lattice_module.js';

describe('FrodoKemUnstructuredLatticeModule Invariant Suite (#2008)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = FrodoKemUnstructuredLatticeModule.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FRODO_KEM_UNSTRUCTURED_LATTICE_MODULE');
    expect(FrodoKemUnstructuredLatticeModule.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = FrodoKemUnstructuredLatticeModule.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(FrodoKemUnstructuredLatticeModule.validate('git status && npm run test')).toBe(true);
  });
});
