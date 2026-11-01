import { describe, it, expect } from 'vitest';
import { createBidiSpoofingDetectorRule } from '../src/armor/bidi_spoofing_detector.js';
import { Verdict } from '../src/types.js';

describe('BidiSpoofingDetector', () => {
  const rule = createBidiSpoofingDetectorRule();

  it('allows standard left-to-right text without override characters', () => {
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: 'Standard English statement.' }
    });
    expect(violation).toBeNull();
  });

  it('blocks right-to-left override character (U+202E)', () => {
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: 'Reverse text: \u202Eerongi lla setadidnac' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('high');
  });
});
