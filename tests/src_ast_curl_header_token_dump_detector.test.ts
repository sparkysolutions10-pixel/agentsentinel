import { describe, it, expect } from 'vitest';
import { CurlHeaderTokenDumpDetector } from '../src/ast/curl_header_token_dump_detector.js';

describe('CurlHeaderTokenDumpDetector Invariant Suite (#1864)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CurlHeaderTokenDumpDetector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CURL_HEADER_TOKEN_DUMP_DETECTOR');
    expect(CurlHeaderTokenDumpDetector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CurlHeaderTokenDumpDetector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CurlHeaderTokenDumpDetector.validate('git status && npm run test')).toBe(true);
  });
});
