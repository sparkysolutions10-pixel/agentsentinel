import { describe, it, expect } from 'vitest';
import {
  PublicAllowlistRegistry,
  defaultPublicAllowlist,
} from '../src/secrets/public_allowlist.js';

describe('Public Key and Non-Sensitive Identifier Allowlist', () => {
  const sampleSSHPublicKey =
    'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC0yV5w7A91234567890abcdefghijklmnopqrstuvwxyz dev@workstation';
  const sampleCert =
    '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAL7V1234567890PublicCertData==\n-----END CERTIFICATE-----';
  const samplePGPPublicKey =
    '-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: BCPG v1.0\n\nmQENBF2r+8ABCDEF12345==\n-----END PGP PUBLIC KEY BLOCK-----';
  const sampleEthAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
  const sampleStellarAccount = 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';
  const sampleCommitSHA = 'd942b2a6c7c6b411a69f382391956df0b50257a9';
  const sampleSRIHash = 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC';

  // Secret counter-examples (MUST NOT BE ALLOWLISTED)
  const sampleRSAPrivateKey =
    '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0Y1o0r...==\n-----END RSA PRIVATE KEY-----';
  const sampleEthPrivateKey = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f3608a9';
  const sampleStellarSecret = 'SCVLSUA5NI6TXY77H4376W3G45S32W5N722P7U5T3N7N2P675E2O3K7B';

  describe('Default Allowlist Verification', () => {
    it('approves standard SSH public keys', () => {
      const res = defaultPublicAllowlist.isAllowlisted(sampleSSHPublicKey);
      expect(res.isAllowed).toBe(true);
      expect(res.matchedType).toBe('ssh_public_key');
    });

    it('approves X.509 public certificates and PGP public key blocks', () => {
      const certRes = defaultPublicAllowlist.isAllowlisted(sampleCert);
      expect(certRes.isAllowed).toBe(true);
      expect(certRes.matchedType).toBe('certificate');

      const pgpRes = defaultPublicAllowlist.isAllowlisted(samplePGPPublicKey);
      expect(pgpRes.isAllowed).toBe(true);
      expect(pgpRes.matchedType).toBe('pgp_public_key');
    });

    it('approves Ethereum and Stellar public addresses', () => {
      const ethRes = defaultPublicAllowlist.isAllowlisted(sampleEthAddress);
      expect(ethRes.isAllowed).toBe(true);
      expect(ethRes.matchedType).toBe('blockchain_address');

      const stellarRes = defaultPublicAllowlist.isAllowlisted(sampleStellarAccount);
      expect(stellarRes.isAllowed).toBe(true);
      expect(stellarRes.matchedType).toBe('blockchain_address');
    });

    it('approves Git commit SHAs and SRI hashes', () => {
      expect(defaultPublicAllowlist.isAllowlisted(sampleCommitSHA).isAllowed).toBe(true);
      expect(defaultPublicAllowlist.isAllowlisted(sampleSRIHash).isAllowed).toBe(true);
    });

    it('strictly rejects private keys and secret seeds', () => {
      expect(defaultPublicAllowlist.isAllowlisted(sampleRSAPrivateKey).isAllowed).toBe(false);
      expect(defaultPublicAllowlist.isAllowlisted(sampleEthPrivateKey).isAllowed).toBe(false);
      expect(defaultPublicAllowlist.isAllowlisted(sampleStellarSecret).isAllowed).toBe(false);
    });
  });

  describe('Custom Literals and Pattern Additions', () => {
    it('registers and matches custom exact literals', () => {
      const customRegistry = new PublicAllowlistRegistry();
      customRegistry.addExact('PUBLIC_PROJECT_IDENTIFIER_2026');

      expect(customRegistry.isAllowlisted('PUBLIC_PROJECT_IDENTIFIER_2026').isAllowed).toBe(true);
      expect(customRegistry.isAllowlisted('OTHER_SECRET_TOKEN').isAllowed).toBe(false);
    });

    it('registers and matches custom regex patterns', () => {
      const customRegistry = new PublicAllowlistRegistry();
      customRegistry.addPattern(/^pub_test_[a-z0-9]{16}$/);

      expect(customRegistry.isAllowlisted('pub_test_12345678abcdef90').isAllowed).toBe(true);
      expect(customRegistry.isAllowlisted('priv_secret_12345678abcdef90').isAllowed).toBe(false);
    });

    it('filters sensitive candidates removing allowlisted public items', () => {
      const registry = new PublicAllowlistRegistry();
      const mixed = [
        sampleEthAddress,
        sampleEthPrivateKey,
        sampleCommitSHA,
        sampleStellarSecret,
      ];

      const sensitiveOnly = registry.filterSensitive(mixed);
      expect(sensitiveOnly).toHaveLength(2);
      expect(sensitiveOnly).toContain(sampleEthPrivateKey);
      expect(sensitiveOnly).toContain(sampleStellarSecret);
      expect(sensitiveOnly).not.toContain(sampleEthAddress);
      expect(sensitiveOnly).not.toContain(sampleCommitSHA);
    });
  });
});
