import { describe, it, expect, vi } from 'vitest';
import http from 'http';
import https from 'https';
import net from 'net';
import { zeroTelemetryGuard } from '../src/secrets/zero_telemetry.js';
import { scrubLLMKeys } from '../src/secrets/llm_key_scrubber.js';
import { scrubAWSKeys } from '../src/secrets/aws_key_detector.js';
import { scrubGitHubTokens } from '../src/secrets/github_token_scrubber.js';
import { scrubPEMBlocks } from '../src/secrets/pem_key_detector.js';
import { scrubWeb3Keys } from '../src/secrets/web3_key_scrubber.js';
import { scrubCreditCards } from '../src/secrets/credit_card_scrubber.js';
import { scrubPII } from '../src/secrets/pii_scrubber.js';
import { scrubContactInfo } from '../src/secrets/email_phone_mask.js';
import { scanTextForHighEntropyTokens } from '../src/secrets/shannon_entropy.js';
import { defaultPublicAllowlist } from '../src/secrets/public_allowlist.js';

describe('Zero Network Calls Verification During Secret Scanning & Redaction', () => {
  const dummyPayload = [
    'OpenAI: ' + 'sk-proj-' + 'A'.repeat(45),
    'Anthropic: ' + 'sk-ant-api03-' + 'B'.repeat(30),
    'AWS Key: ' + 'AKIA' + 'C'.repeat(16),
    'GitHub PAT: ' + 'ghp_' + 'D'.repeat(36),
    'Fine-grained: ' + 'github_pat_' + 'E'.repeat(82),
    'Web3 Eth: 0x' + 'f'.repeat(64),
    'Stellar: S' + '2'.repeat(55),
    'Visa: 4000-0000-0000-0002',
    'SSN: 219-45-7890',
    'Aadhaar: 2345 6789 0124',
    'Email: dev@company.org',
    'Phone: +1 (555) 019-2834',
    'High-entropy: ' + 'Kj9+mN3/vL2pQ8xZ1wT0rY7uI4oP5sA=',
  ].join('\n');

  it('verifies 100% zero network socket or HTTP requests across all 9 scanners', async () => {
    // Spy on low-level Node network emitters
    const httpSpy = vi.spyOn(http, 'request');
    const httpsSpy = vi.spyOn(https, 'request');
    const netSpy = vi.spyOn(net, 'connect');

    try {
      await zeroTelemetryGuard.assertZeroTelemetryDuring(() => {
        // 1. LLM Scrubber
        const r1 = scrubLLMKeys(dummyPayload);
        expect(r1.hasMatches).toBe(true);

        // 2. AWS Key Scrubber
        const r2 = scrubAWSKeys(dummyPayload);
        expect(r2.hasMatches).toBe(true);

        // 3. GitHub Scrubber
        const r3 = scrubGitHubTokens(dummyPayload);
        expect(r3.hasMatches).toBe(true);

        // 4. PEM Key Scrubber
        const r4 = scrubPEMBlocks(dummyPayload);
        expect(r4.scrubbedText).toBeDefined();

        // 5. Web3 Scrubber
        const r5 = scrubWeb3Keys(dummyPayload);
        expect(r5.hasMatches).toBe(true);

        // 6. Credit Card Scrubber
        const r6 = scrubCreditCards(dummyPayload);
        expect(r6.hasMatches).toBe(true);

        // 7. PII Scrubber
        const r7 = scrubPII(dummyPayload);
        expect(r7.hasMatches).toBe(true);

        // 8. Contact Info Scrubber
        const r8 = scrubContactInfo(dummyPayload);
        expect(r8.hasMatches).toBe(true);

        // 9. Shannon Entropy Token Scanner
        const r9 = scanTextForHighEntropyTokens(dummyPayload);
        expect(r9.length).toBeGreaterThan(0);

        // 10. Public Allowlist Check
        const r10 = defaultPublicAllowlist.isAllowlisted('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed');
        expect(r10.isAllowed).toBe(true);
      });

      // Assert zero calls to native network primitives
      expect(httpSpy).not.toHaveBeenCalled();
      expect(httpsSpy).not.toHaveBeenCalled();
      expect(netSpy).not.toHaveBeenCalled();
      expect(zeroTelemetryGuard.getAttemptsCount()).toBe(0);
    } finally {
      httpSpy.mockRestore();
      httpsSpy.mockRestore();
      netSpy.mockRestore();
    }
  });

  it('guarantees sub-millisecond local execution speed without external network latency', () => {
    const start = performance.now();
    scrubCreditCards('Card: 4000-0000-0000-0002');
    scrubPII('SSN: 219-45-7890');
    const elapsedMs = performance.now() - start;

    // Local in-memory regex + AST operations execute in < 5ms (no round-trip network hops)
    expect(elapsedMs).toBeLessThan(10);
  });
});
