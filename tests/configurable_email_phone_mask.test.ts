import { describe, it, expect } from 'vitest';
import {
  detectContactInfo,
  scrubContactInfo,
  createEmailPhoneMaskRule,
} from '../src/secrets/email_phone_mask.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Configurable Email and Phone Masking Matrix', () => {
  const testEmail = 'john.doe@enterprise.com';
  const testPhoneUS = '+1 (800) 555-0199';
  const testPhoneIN = '+91 98765 43210';
  const testPhoneUK = '+44 20 7946 0919';

  describe('Feature Toggles (maskEmail vs maskPhone)', () => {
    it('masks only phone when maskEmail is disabled', () => {
      const text = `Contact: ${testEmail} or ${testPhoneUS}`;
      const result = scrubContactInfo(text, { maskEmail: false, maskPhone: true });

      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).toContain(testEmail); // Email preserved
      expect(result.scrubbedText).not.toContain(testPhoneUS); // Phone masked
    });

    it('masks only email when maskPhone is disabled', () => {
      const text = `Contact: ${testEmail} or ${testPhoneUS}`;
      const result = scrubContactInfo(text, { maskEmail: true, maskPhone: false });

      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).not.toContain(testEmail); // Email masked
      expect(result.scrubbedText).toContain(testPhoneUS); // Phone preserved
    });
  });

  describe('Custom String Replacements', () => {
    it('uses customEmailReplacement and customPhoneReplacement when specified', () => {
      const text = `User ${testEmail} called ${testPhoneIN}`;
      const result = scrubContactInfo(text, {
        customEmailReplacement: '[ANONYMOUS_EMAIL]',
        customPhoneReplacement: '[ANONYMOUS_PHONE]',
      });

      expect(result.scrubbedText).toBe('User [ANONYMOUS_EMAIL] called [ANONYMOUS_PHONE]');
    });
  });

  describe('International Format Coverage', () => {
    it('accurately masks US, Indian, and UK phone formats', () => {
      const corpus = [
        `US: ${testPhoneUS}`,
        `IN: ${testPhoneIN}`,
        `UK: ${testPhoneUK}`,
      ].join('\n');

      const result = scrubContactInfo(corpus, { phoneFormat: 'last4' });
      expect(result.scrubbedText).toContain('US: ***-***-0199');
      expect(result.scrubbedText).toContain('IN: ***-***-3210');
      expect(result.scrubbedText).toContain('UK: ***-***-0919');
    });
  });

  describe('False Positive Immunity', () => {
    it('does not mask version numbers, IP addresses, dates, or math operations', () => {
      const benignText = [
        'Version: 2.1.9',
        'Release Date: 2026-10-30',
        'Server IP: 192.168.1.1',
        'Calculation: 100 - 50 = 50',
      ].join('\n');

      const matches = detectContactInfo(benignText);
      expect(matches).toHaveLength(0);

      const scrubbed = scrubContactInfo(benignText);
      expect(scrubbed.hasMatches).toBe(false);
      expect(scrubbed.scrubbedText).toBe(benignText);
    });
  });

  describe('AgentSentinel Rule Selective Mode Integration', () => {
    it('evaluates rule with custom options in tool parameters', () => {
      const customRule = createEmailPhoneMaskRule({
        mode: 'redact',
        maskPhone: false,
        emailFormat: 'domain_only',
      });

      const ctx: ToolCallContext = {
        id: 'opt-ctx',
        toolName: 'send_newsletter',
        params: {
          subscriber: testEmail,
          supportLine: testPhoneUS,
        },
        timestamp: Date.now(),
      };

      const violation = customRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);

      // Email is masked to domain only
      expect(violation?.redactedParams?.subscriber).toBe('***@enterprise.com');
      // Phone is preserved because maskPhone is false
      expect(violation?.redactedParams?.supportLine).toBe(testPhoneUS);
    });
  });
});
