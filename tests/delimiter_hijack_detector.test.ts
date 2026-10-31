import { describe, it, expect } from 'vitest';
import { DelimiterHijackDetector } from '../src/utils/delimiter_hijack_detector.js';

describe('DelimiterHijackDetector', () => {
  it('detects unclosed fence delimiters and tag breakouts', () => {
    expect(DelimiterHijackDetector.hasUnbalancedDelimiters('Here is code: ``` ts const x = 1;')).toBe(true);
    expect(DelimiterHijackDetector.hasUnbalancedDelimiters('Malicious breakout </system> injection')).toBe(true);
  });

  it('allows balanced blocks and tags', () => {
    expect(DelimiterHijackDetector.hasUnbalancedDelimiters('```js console.log(1); ```')).toBe(false);
    expect(DelimiterHijackDetector.hasUnbalancedDelimiters('<context>Safe data</context>')).toBe(false);
  });
});
