import { describe, it, expect } from 'vitest';
import {
  detectPII,
  scrubPII,
  createPIIScrubberRule,
} from '../src/secrets/pii_scrubber.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('SSN and Aadhaar Regex Redaction in Text Payloads', () => {
  const ssnDash = '219-45-7890';
  const ssnSpace = '219 45 7890';
  const aadhaarSpace = '4123 4567 8903';
  const aadhaarDash = '4123-4567-8903';

  describe('Mixed Multi-PII Document Redaction', () => {
    it('redacts multiple SSNs and Aadhaar cards in single multi-line document', () => {
      const document = `
Customer Profile:
- Full Name: John Doe
- US Tax Identification (SSN): ${ssnDash}
- Indian Identity (Aadhaar): ${aadhaarSpace}
- Contact Phone: +1-555-0199
- Postal Code: 90210
- Date of Birth: 1985-12-04
`;

      const result = scrubPII(document);
      expect(result.hasMatches).toBe(true);

      // Verify PII is masked
      expect(result.scrubbedText).not.toContain(ssnDash);
      expect(result.scrubbedText).not.toContain(aadhaarSpace);
      expect(result.scrubbedText).toContain('***-**-7890');
      expect(result.scrubbedText).toContain('XXXX-XXXX-8903');

      // Verify benign numbers (phone, zip, date) remain unchanged
      expect(result.scrubbedText).toContain('+1-555-0199');
      expect(result.scrubbedText).toContain('90210');
      expect(result.scrubbedText).toContain('1985-12-04');
    });

    it('supports custom replacement tokens across SSN and Aadhaar occurrences', () => {
      const payload = `SSN1: ${ssnSpace}, SSN2: ${ssnDash}, Aadhaar: ${aadhaarDash}`;
      const result = scrubPII(payload, { replacement: '[CONFIDENTIAL_PII]' });

      expect(result.scrubbedText).toBe('SSN1: [CONFIDENTIAL_PII], SSN2: [CONFIDENTIAL_PII], Aadhaar: [CONFIDENTIAL_PII]');
    });
  });

  describe('Structured JSON Payloads', () => {
    it('redacts PII values in JSON text without corrupting quotes or commas', () => {
      const jsonObj = {
        users: [
          { id: 1, ssn: ssnDash, aadhaar: aadhaarSpace },
          { id: 2, ssn: '987-65-4321', aadhaar: '3210 5432 1098' },
        ],
      };

      const rawJson = JSON.stringify(jsonObj, null, 2);
      const scrubbed = scrubPII(rawJson, { replacement: '[REDACTED]' });

      expect(scrubbed.hasMatches).toBe(true);
      expect(scrubbed.scrubbedText).not.toContain(ssnDash);
      expect(scrubbed.scrubbedText).not.toContain(aadhaarSpace);

      // JSON should remain valid syntax
      const parsed = JSON.parse(scrubbed.scrubbedText);
      expect(parsed.users[0].ssn).toBe('[REDACTED]');
      expect(parsed.users[0].aadhaar).toBe('[REDACTED]');
      expect(parsed.users[0].id).toBe(1);
    });
  });

  describe('AgentSentinel Rule Selective Blocking', () => {
    it('blocks tool calls when blockSSN is true and SSN is present', () => {
      const rule = createPIIScrubberRule({ mode: 'block', blockSSN: true, blockAadhaar: false });
      const ctx: ToolCallContext = {
        id: 'ssn-only-block',
        toolName: 'create_record',
        params: { ssn: ssnDash },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('US_SSN');
    });

    it('allows tool call when blockAadhaar is false and only Aadhaar is present', () => {
      const rule = createPIIScrubberRule({ mode: 'block', blockSSN: true, blockAadhaar: false });
      const ctx: ToolCallContext = {
        id: 'aadhaar-allowed',
        toolName: 'create_record',
        params: { nationalId: aadhaarSpace },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('redacts PII in deeply nested tool call parameters', () => {
      const rule = createPIIScrubberRule({ mode: 'redact' });
      const ctx: ToolCallContext = {
        id: 'nested-pii-call',
        toolName: 'sync_directory',
        params: {
          batch: {
            members: [
              { name: 'Alice', ssn: ssnDash },
              { name: 'Raj', aadhaar: aadhaarDash },
            ],
          },
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);
      expect(violation?.redactedParams?.batch.members[0].ssn).toBe('***-**-7890');
      expect(violation?.redactedParams?.batch.members[1].aadhaar).toBe('XXXX-XXXX-8903');
    });
  });
});
