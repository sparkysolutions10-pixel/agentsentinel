import { describe, it, expect } from 'vitest';
import {
  detectPEMBlocks,
  scrubPEMBlocks,
  createPEMKeyDetectorRule,
} from '../src/secrets/pem_key_detector.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('PEM Private Key Block Detection and Blocking', () => {
  const rsaKeyRaw = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAw7Z7V8...Payload...
KCAQEAw7Z7V8abc==
-----END RSA PRIVATE KEY-----`;

  const jsonEscapedRSAKey =
    '-----BEGIN RSA PRIVATE KEY-----\\nMIIEowIBAAKCAQEAw7Z7V8...Payload...\\nKCAQEAw7Z7V8abc==\\n-----END RSA PRIVATE KEY-----';

  const dsaKey = `-----BEGIN DSA PRIVATE KEY-----
MIIBuwIBAAKCAQEA123...DSAPayload...
-----END DSA PRIVATE KEY-----`;

  const pgpPrivateKey = `-----BEGIN PGP PRIVATE KEY BLOCK-----
Version: BCPG C# v1.6.1.0

lQO+BF2r+8ABCDEF...PGPPrivateData...
-----END PGP PRIVATE KEY BLOCK-----`;

  const pgpPublicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: BCPG C# v1.6.1.0

mQENBF2r+8ABCDEF...PGPPublicData...
-----END PGP PUBLIC KEY BLOCK-----`;

  const encryptedKey = `-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIFDjBABgkqhkiG9w0BBQ0wMzAbBgkqhkiG9w0BBQwwDgQI...EncryptedBody...
-----END ENCRYPTED PRIVATE KEY-----`;

  describe('Single-line and JSON Escaped PEM Formats', () => {
    it('detects standard multiline PEM blocks', () => {
      const matches = detectPEMBlocks(rsaKeyRaw);
      expect(matches).toHaveLength(1);
      expect(matches[0].keyType).toBe('RSA_PRIVATE');
    });

    it('detects JSON-escaped single-line PEM blocks with escaped newlines (\\n)', () => {
      const matches = detectPEMBlocks(jsonEscapedRSAKey);
      expect(matches).toHaveLength(1);
      expect(matches[0].keyType).toBe('RSA_PRIVATE');
    });

    it('scrubs JSON-escaped PEM blocks preserving string structure', () => {
      const jsonStr = `{"private_key":"${jsonEscapedRSAKey}","service":"api"}`;
      const result = scrubPEMBlocks(jsonStr, { replacement: '[REDACTED_RSA_KEY]' });

      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).toBe('{"private_key":"[REDACTED_RSA_KEY]","service":"api"}');
    });
  });

  describe('PGP and DSA Key Detection', () => {
    it('detects DSA private keys', () => {
      const matches = detectPEMBlocks(dsaKey);
      expect(matches).toHaveLength(1);
      expect(matches[0].keyType).toBe('DSA_PRIVATE');
    });

    it('detects PGP private key blocks and ignores PGP public key blocks', () => {
      const combined = `${pgpPrivateKey}\n\n${pgpPublicKey}`;
      const matches = detectPEMBlocks(combined);

      expect(matches).toHaveLength(1);
      expect(matches[0].keyType).toBe('PGP_PRIVATE');
      expect(matches[0].rawBlock).toContain('BEGIN PGP PRIVATE KEY BLOCK');
    });
  });

  describe('Policy Enforcement and Encrypted Key Filtering', () => {
    it('blocks both unencrypted and encrypted keys by default', () => {
      const defaultRule = createPEMKeyDetectorRule();

      const ctxEncrypted: ToolCallContext = {
        id: 'pem-enc-block',
        toolName: 'execute_command',
        params: { key: encryptedKey },
        timestamp: Date.now(),
      };

      const violation = defaultRule.evaluate(ctxEncrypted);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('ENCRYPTED_PRIVATE');
    });

    it('allows encrypted private keys when blockEncrypted is set to false', () => {
      const permissiveRule = createPEMKeyDetectorRule({ blockEncrypted: false });

      const ctxEncrypted: ToolCallContext = {
        id: 'pem-enc-allow',
        toolName: 'execute_command',
        params: { key: encryptedKey },
        timestamp: Date.now(),
      };

      const violation = permissiveRule.evaluate(ctxEncrypted);
      expect(violation).toBeNull();

      // But still blocks unencrypted RSA keys
      const ctxPlain: ToolCallContext = {
        id: 'pem-plain-block',
        toolName: 'execute_command',
        params: { key: rsaKeyRaw },
        timestamp: Date.now(),
      };

      const plainViolation = permissiveRule.evaluate(ctxPlain);
      expect(plainViolation).not.toBeNull();
      expect(plainViolation?.verdict).toBe(Verdict.BLOCK);
      expect(plainViolation?.reason).toContain('RSA_PRIVATE');
    });
  });

  describe('Deep Tool Parameter Tree Inspection', () => {
    const rule = createPEMKeyDetectorRule();

    it('identifies private key locations in nested config maps and arrays', () => {
      const ctx: ToolCallContext = {
        id: 'complex-nesting',
        toolName: 'provision_cluster',
        params: {
          nodes: [
            { id: 'node-1', certs: { cert: 'PUBLIC_CERT_DATA' } },
            { id: 'node-2', certs: { cert: 'PUBLIC_CERT_DATA', adminKey: rsaKeyRaw } },
          ],
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('nodes[1].certs.adminKey');
    });
  });
});
