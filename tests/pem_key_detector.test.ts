import { describe, it, expect } from 'vitest';
import {
  detectPEMBlocks,
  scrubPEMBlocks,
  maskPEMBlock,
  createPEMKeyDetectorRule,
  redactPEMBlocksInParams,
} from '../src/secrets/pem_key_detector.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('PEM Key Detector', () => {
  const sampleRSAPrivateKey = [
    '-----BEGIN RSA PRIVATE KEY-----',
    'MIIEowIBAAKCAQEA0Y1o0r+8...sampleRSAContent...ABCDEF1234567890==',
    '-----END RSA PRIVATE KEY-----',
  ].join('\n');

  const samplePKCS8PrivateKey = [
    '-----BEGIN PRIVATE KEY-----',
    'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD...XYZ==',
    '-----END PRIVATE KEY-----',
  ].join('\n');

  const sampleECPrivateKey = [
    '-----BEGIN EC PRIVATE KEY-----',
    'MHcCAQEEIABC1234...ECPayload...XYZ==',
    '-----END EC PRIVATE KEY-----',
  ].join('\n');

  const sampleOpenSSHPrivateKey = [
    '-----BEGIN OPENSSH PRIVATE KEY-----',
    'b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlw...',
    '-----END OPENSSH PRIVATE KEY-----',
  ].join('\n');

  const sampleCertificate = [
    '-----BEGIN CERTIFICATE-----',
    'MIIDXTCCAkWgAwIBAgIJAL7V...PublicCert...==',
    '-----END CERTIFICATE-----',
  ].join('\n');

  const samplePublicKey = [
    '-----BEGIN PUBLIC KEY-----',
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Y1o0r...',
    '-----END PUBLIC KEY-----',
  ].join('\n');

  describe('detectPEMBlocks', () => {
    it('detects RSA, PKCS#8, EC, and OpenSSH private keys', () => {
      const text = `${sampleRSAPrivateKey}\n\n${sampleECPrivateKey}\n\n${sampleOpenSSHPrivateKey}`;
      const matches = detectPEMBlocks(text);

      expect(matches).toHaveLength(3);
      expect(matches[0].keyType).toBe('RSA_PRIVATE');
      expect(matches[1].keyType).toBe('EC_PRIVATE');
      expect(matches[2].keyType).toBe('OPENSSH_PRIVATE');
    });

    it('does not trigger on public keys or certificates', () => {
      const text = `${samplePublicKey}\n\n${sampleCertificate}`;
      const matches = detectPEMBlocks(text);

      expect(matches).toHaveLength(0);
    });

    it('detects encrypted PKCS#8 private keys with isEncrypted set to true', () => {
      const encKey = [
        '-----BEGIN ENCRYPTED PRIVATE KEY-----',
        'MIIFDjBABgkqhkiG9w0BBQ0wMzAbBgkqhkiG9w0BBQwwDgQI...==',
        '-----END ENCRYPTED PRIVATE KEY-----',
      ].join('\n');

      const matches = detectPEMBlocks(encKey);
      expect(matches).toHaveLength(1);
      expect(matches[0].keyType).toBe('ENCRYPTED_PRIVATE');
      expect(matches[0].isEncrypted).toBe(true);
    });
  });

  describe('masking and scrubbing', () => {
    it('masks private key preserving header and footer while redacting content body', () => {
      const masked = maskPEMBlock('-----BEGIN RSA PRIVATE KEY-----', '-----END RSA PRIVATE KEY-----');
      expect(masked).toContain('-----BEGIN RSA PRIVATE KEY-----');
      expect(masked).toContain('[REDACTED_PRIVATE_KEY_BODY]');
      expect(masked).toContain('-----END RSA PRIVATE KEY-----');
    });

    it('scrubs private key in a configuration string', () => {
      const text = `SERVER_KEY="${samplePKCS8PrivateKey}"\nPORT=443`;
      const scrubbed = scrubPEMBlocks(text, { replacement: '[REDACTED_KEY]' });

      expect(scrubbed.hasMatches).toBe(true);
      expect(scrubbed.scrubbedText).toBe('SERVER_KEY="[REDACTED_KEY]"\nPORT=443');
    });
  });

  describe('createPEMKeyDetectorRule', () => {
    const rule = createPEMKeyDetectorRule();

    it('allows tool contexts with public keys only', () => {
      const ctx: ToolCallContext = {
        id: 'pem-public-call',
        toolName: 'configure_ssh',
        params: {
          pubkey: samplePublicKey,
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('blocks tool calls with private keys in parameters', () => {
      const ctx: ToolCallContext = {
        id: 'pem-private-call',
        toolName: 'write_file',
        params: {
          path: '/etc/ssl/private.key',
          content: sampleRSAPrivateKey,
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('Disallowed private cryptographic key PEM block');
    });

    it('redacts private keys when configured with redact mode', () => {
      const redactRule = createPEMKeyDetectorRule({ mode: 'redact' });
      const ctx: ToolCallContext = {
        id: 'pem-redact-call',
        toolName: 'save_secret',
        params: {
          key: sampleECPrivateKey,
        },
        timestamp: Date.now(),
      };

      const violation = redactRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);
      expect(violation?.redactedParams?.key).toBe('[REDACTED_PRIVATE_KEY_BLOCK]');
    });
  });
});
