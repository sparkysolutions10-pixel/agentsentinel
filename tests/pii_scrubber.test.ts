import { describe, it, expect } from 'vitest';
import {
  isValidSSN,
  isValidAadhaar,
  validateVerhoeff,
  detectPII,
  scrubPII,
  maskSSN,
  maskAadhaar,
  createPIIScrubberRule,
} from '../src/secrets/pii_scrubber.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('PII Scrubber: SSN and Aadhaar Card', () => {
  const sampleSSN = '123-45-6789';
  const sampleAadhaar = '2345 6789 0124'; // Valid Verhoeff checksum
  const sampleAadhaarHyphen = '2345-6789-0124';

  describe('isValidSSN', () => {
    it('accepts valid formatted SSN', () => {
      expect(isValidSSN(sampleSSN)).toBe(true);
    });

    it('rejects SSN with invalid area codes (000, 666, 900+)', () => {
      expect(isValidSSN('000-45-6789')).toBe(false);
      expect(isValidSSN('666-45-6789')).toBe(false);
      expect(isValidSSN('912-45-6789')).toBe(false);
    });

    it('rejects SSN with invalid group (00) or serial (0000)', () => {
      expect(isValidSSN('123-00-6789')).toBe(false);
      expect(isValidSSN('123-45-0000')).toBe(false);
    });
  });

  describe('isValidAadhaar and Verhoeff validation', () => {
    it('validates 12-digit Aadhaar starting with 2-9', () => {
      expect(isValidAadhaar(sampleAadhaar)).toBe(true);
      expect(isValidAadhaar(sampleAadhaarHyphen)).toBe(true);
    });

    it('rejects numbers starting with 0 or 1', () => {
      expect(isValidAadhaar('0123 4567 8901')).toBe(false);
      expect(isValidAadhaar('1234 5678 9012')).toBe(false);
    });

    it('verifies mathematical Verhoeff checksum on generated Aadhaar numbers', () => {
      expect(validateVerhoeff('234567890124')).toBe(true);
      expect(validateVerhoeff('234567890129')).toBe(false);
    });
  });

  describe('Masking and Scrubbing', () => {
    it('masks SSN retaining only last 4 digits', () => {
      expect(maskSSN(sampleSSN)).toBe('***-**-6789');
    });

    it('masks Aadhaar retaining only last 4 digits', () => {
      expect(maskAadhaar(sampleAadhaar)).toBe('XXXX-XXXX-0124');
    });

    it('scrubs SSN and Aadhaar numbers from text payloads', () => {
      const text = `User SSN: ${sampleSSN}, Aadhaar: ${sampleAadhaar}`;
      const result = scrubPII(text);

      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).not.toContain(sampleSSN);
      expect(result.scrubbedText).not.toContain(sampleAadhaar);
      expect(result.scrubbedText).toContain('***-**-6789');
      expect(result.scrubbedText).toContain('XXXX-XXXX-0124');
    });
  });

  describe('createPIIScrubberRule', () => {
    const rule = createPIIScrubberRule();

    it('allows tool contexts without PII', () => {
      const ctx: ToolCallContext = {
        id: 'pii-clean',
        toolName: 'query_user',
        params: { username: 'alice', role: 'admin' },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('blocks tool calls with exposed SSN in parameters', () => {
      const ctx: ToolCallContext = {
        id: 'pii-ssn-block',
        toolName: 'register_employee',
        params: {
          name: 'Bob',
          taxId: sampleSSN,
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('US_SSN');
    });

    it('redacts Aadhaar numbers when configured in redact mode', () => {
      const redactRule = createPIIScrubberRule({ mode: 'redact' });
      const ctx: ToolCallContext = {
        id: 'pii-aadhaar-redact',
        toolName: 'kyc_verify',
        params: {
          documentNumber: sampleAadhaar,
        },
        timestamp: Date.now(),
      };

      const violation = redactRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);
      expect(violation?.redactedParams?.documentNumber).toBe('XXXX-XXXX-0124');
    });
  });
});
