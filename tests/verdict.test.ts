import { describe, it, expect } from 'vitest';
import {
  Verdict,
  isVerdict,
  assertVerdict,
  parseVerdict,
  getVerdictRank
} from '../src/types.js';

describe('Verdict Schema & Type Guards (Issue #3)', () => {
  it('correctly identifies valid Verdict values with isVerdict', () => {
    expect(isVerdict(Verdict.ALLOW)).toBe(true);
    expect(isVerdict(Verdict.BLOCK)).toBe(true);
    expect(isVerdict(Verdict.REDACT)).toBe(true);
    expect(isVerdict(Verdict.CONFIRM)).toBe(true);
    expect(isVerdict('ALLOW')).toBe(true);
    expect(isVerdict('INVALID')).toBe(false);
    expect(isVerdict(null)).toBe(false);
    expect(isVerdict(123)).toBe(false);
    expect(isVerdict({})).toBe(false);
  });

  it('assertVerdict passes on valid verdicts and throws on invalid values', () => {
    expect(() => assertVerdict(Verdict.ALLOW)).not.toThrow();
    expect(() => assertVerdict(Verdict.BLOCK)).not.toThrow();
    expect(() => assertVerdict('REDACT')).not.toThrow();
    expect(() => assertVerdict('UNKNOWN')).toThrow(TypeError);
    expect(() => assertVerdict(null)).toThrow(TypeError);
  });

  it('safely parses strings case-insensitively with parseVerdict', () => {
    expect(parseVerdict('allow')).toBe(Verdict.ALLOW);
    expect(parseVerdict('  Block  ')).toBe(Verdict.BLOCK);
    expect(parseVerdict('redact')).toBe(Verdict.REDACT);
    expect(parseVerdict('confirm')).toBe(Verdict.CONFIRM);
    expect(parseVerdict('malicious_input', Verdict.BLOCK)).toBe(Verdict.BLOCK);
    expect(parseVerdict(undefined, Verdict.CONFIRM)).toBe(Verdict.CONFIRM);
  });

  it('enforces correct restrictive ranking order with getVerdictRank', () => {
    expect(getVerdictRank(Verdict.BLOCK)).toBeGreaterThan(getVerdictRank(Verdict.CONFIRM));
    expect(getVerdictRank(Verdict.CONFIRM)).toBeGreaterThan(getVerdictRank(Verdict.REDACT));
    expect(getVerdictRank(Verdict.REDACT)).toBeGreaterThan(getVerdictRank(Verdict.ALLOW));
  });
});
