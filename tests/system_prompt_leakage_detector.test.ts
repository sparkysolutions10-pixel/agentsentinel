import { describe, it, expect } from 'vitest';
import { SystemPromptLeakageDetector } from '../src/utils/system_prompt_leakage_detector.js';

describe('SystemPromptLeakageDetector', () => {
  it('detects canary token disclosure', () => {
    const response = 'Here is the secret: CANARY_SECRET_XYZ_999';
    expect(SystemPromptLeakageDetector.containsLeakage(response, ['CANARY_SECRET_XYZ_999'])).toBe(true);
  });

  it('detects system instruction disclosure phrases', () => {
    expect(SystemPromptLeakageDetector.containsLeakage('My system prompt is to guard the keys')).toBe(true);
    expect(SystemPromptLeakageDetector.containsLeakage('Here is the requested financial report')).toBe(false);
  });
});
