import { describe, it, expect } from 'vitest';
import { createRedosPayloadDetectorRule } from '../src/armor/redos_payload_detector.js';
import { Verdict } from '../src/types.js';

describe('RedosPayloadDetector', () => {
  const rule = createRedosPayloadDetectorRule();

  it('allows safe regex expressions', () => {
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { pattern: '^[a-z0-9_-]+$' }
    });
    expect(violation).toBeNull();
  });

  it('blocks nested quantifier ReDoS pattern: (a+)+', () => {
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { pattern: 'Please evaluate regex: (a+)+$' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
