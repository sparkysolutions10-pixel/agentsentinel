import { describe, it, expect } from 'vitest';
import {
  maskEmail,
  maskPhone,
  detectContactInfo,
  scrubContactInfo,
  createEmailPhoneMaskRule,
} from '../src/secrets/email_phone_mask.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Email and Phone Privacy Mask Rule', () => {
  const sampleEmail = 'alex.smith@company.org';
  const samplePhone = '+1 (555) 234-5678';
  const sampleIntlPhone = '+91 98765 43210';

  describe('maskEmail formats', () => {
    it('applies partial masking preserving first and last chars of username', () => {
      const masked = maskEmail(sampleEmail, 'partial');
      expect(masked).toBe('a***h@company.org');
    });

    it('applies domain_only masking', () => {
      const masked = maskEmail(sampleEmail, 'domain_only');
      expect(masked).toBe('***@company.org');
    });

    it('applies token replacement', () => {
      const masked = maskEmail(sampleEmail, 'token');
      expect(masked).toBe('[REDACTED_EMAIL]');
    });
  });

  describe('maskPhone formats', () => {
    it('applies partial masking with country prefix', () => {
      const masked = maskPhone(samplePhone, 'partial');
      expect(masked).toBe('+1  ***-***-5678');
    });

    it('applies last4 masking format', () => {
      const masked = maskPhone(samplePhone, 'last4');
      expect(masked).toBe('***-***-5678');
    });

    it('applies token replacement', () => {
      const masked = maskPhone(samplePhone, 'token');
      expect(masked).toBe('[REDACTED_PHONE]');
    });
  });

  describe('detectContactInfo and scrubContactInfo', () => {
    it('detects both email and phone numbers in message text', () => {
      const message = `Please reach out to ${sampleEmail} or call us at ${samplePhone}.`;
      const matches = detectContactInfo(message);

      expect(matches).toHaveLength(2);
      expect(matches.some((m) => m.type === 'Email')).toBe(true);
      expect(matches.some((m) => m.type === 'Phone')).toBe(true);
    });

    it('scrubs contact info from text with configurable format', () => {
      const text = `Contact: ${sampleEmail} | ${samplePhone}`;
      const result = scrubContactInfo(text, { emailFormat: 'domain_only', phoneFormat: 'last4' });

      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).toBe('Contact: ***@company.org | ***-***-5678');
    });
  });

  describe('createEmailPhoneMaskRule', () => {
    const rule = createEmailPhoneMaskRule({ mode: 'redact' });

    it('allows clean tool contexts without contact info', () => {
      const ctx: ToolCallContext = {
        id: 'clean-ctx',
        toolName: 'read_system_info',
        params: { os: 'linux', kernel: '5.15' },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('redacts email and phone parameters in tool call context', () => {
      const ctx: ToolCallContext = {
        id: 'contact-call',
        toolName: 'send_invitation',
        params: {
          recipient: sampleEmail,
          phone: samplePhone,
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);
      expect(violation?.redactedParams?.recipient).not.toBe(sampleEmail);
      expect(violation?.redactedParams?.phone).not.toBe(samplePhone);
    });

    it('blocks execution when configured in block mode', () => {
      const blockRule = createEmailPhoneMaskRule({ mode: 'block' });
      const ctx: ToolCallContext = {
        id: 'contact-block-call',
        toolName: 'export_leads',
        params: { leadEmail: sampleEmail },
        timestamp: Date.now(),
      };

      const violation = blockRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('Disallowed personal contact info');
    });
  });
});
