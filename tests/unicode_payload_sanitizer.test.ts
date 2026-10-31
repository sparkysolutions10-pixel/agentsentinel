import { describe, it, expect } from 'vitest';
import { createUnicodePayloadSanitizerRule } from '../src/web3/unicode_payload_sanitizer.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('UnicodePayloadSanitizer', () => {
  const rule = createUnicodePayloadSanitizerRule();

  it('allows clean plain text parameters', () => {
    const context: ToolCallContext = {
      id: 'tx_clean_memo',
      toolName: 'stellar_payment',
      params: { memo: 'Standard invoice #1234 payment' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks parameter containing zero-width space (U+200B)', () => {
    const context: ToolCallContext = {
      id: 'tx_zws_memo',
      toolName: 'stellar_payment',
      params: { memo: 'admin\u200B_override_transfer' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toBe('INVISIBLE_UNICODE_DETECTED');
  });

  it('blocks parameter containing right-to-left override character (U+202E)', () => {
    const context: ToolCallContext = {
      id: 'tx_bdo_memo',
      toolName: 'stellar_payment',
      params: { memo: 'legit\u202Edrowssap' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
