import { describe, it, expect } from 'vitest';
import { GarbledCircuitsEngine } from '../src/crypto/garbled_circuits.js';

describe('Yao Garbled Circuits Engine (#827 & #828)', () => {
  it('evaluates boolean policy gates privately', () => {
    const res1 = GarbledCircuitsEngine.evaluatePolicyAnd(1, 1);
    expect(res1.outcome).toBe(1);
    expect(res1.privacyPreserved).toBe(true);

    const res2 = GarbledCircuitsEngine.evaluatePolicyAnd(1, 0);
    expect(res2.outcome).toBe(0);

    const gate = GarbledCircuitsEngine.evaluateThresholdGate(150, 100);
    expect(gate.passed).toBe(true);
  });
});
