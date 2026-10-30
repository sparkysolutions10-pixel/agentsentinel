import { describe, it, expect } from 'vitest';
import {
  PublicAllowlistRegistry,
  defaultPublicAllowlist,
} from '../src/secrets/public_allowlist.js';
import { scrubWeb3Keys, createWeb3KeyScrubberRule } from '../src/secrets/web3_key_scrubber.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Public Key Allowlist Preservation Test', () => {
  const publicEthAddress = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
  const privateEthKey = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f3608a9';
  const publicStellarAccount = 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';
  const secretStellarSeed = 'SCVLSUA5NI6TXY77H4376W3G45S32W5N722P7U5T3N7N2P675E2O3K7B';
  const publicSSHRSAKey = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC0yV5w7A91234567890abcdef user@host';

  describe('Mixed Text Redaction Precision', () => {
    it('redacts private key while leaving public Ethereum address unredacted', () => {
      const text = `Transfer to ${publicEthAddress} using signer key ${privateEthKey}`;
      const result = scrubWeb3Keys(text, { replacement: '[REDACTED_SECRET_KEY]' });

      expect(result.hasMatches).toBe(true);
      // Private key is removed
      expect(result.scrubbedText).not.toContain(privateEthKey);
      expect(result.scrubbedText).toContain('[REDACTED_SECRET_KEY]');

      // Public address remains completely intact
      expect(result.scrubbedText).toContain(publicEthAddress);
    });

    it('redacts Stellar secret seed while leaving Stellar public account intact', () => {
      const text = `Account: ${publicStellarAccount}, Seed: ${secretStellarSeed}`;
      const result = scrubWeb3Keys(text);

      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).not.toContain(secretStellarSeed);
      expect(result.scrubbedText).toContain(publicStellarAccount);
    });
  });

  describe('Batch Public Address Processing', () => {
    it('processes batch of public addresses without a single false redaction', () => {
      const batchAddresses = [
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8',
        'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A',
        'GCKG5WGBIJP74UDNRDAQ5POQGSQCPMA2UD2TTRGIBWOLQQ2HSA5TV227',
      ];

      for (const addr of batchAddresses) {
        const allowCheck = defaultPublicAllowlist.isAllowlisted(addr);
        expect(allowCheck.isAllowed).toBe(true);

        const scrubResult = scrubWeb3Keys(addr);
        expect(scrubResult.hasMatches).toBe(false);
        expect(scrubResult.scrubbedText).toBe(addr);
      }
    });
  });

  describe('AgentSentinel Rule Tool Parameter Integrity', () => {
    const rule = createWeb3KeyScrubberRule({ mode: 'redact' });

    it('preserves public recipients in multi-recipient tool parameter structures', () => {
      const ctx: ToolCallContext = {
        id: 'airdrop-call',
        toolName: 'multisend_token',
        params: {
          recipients: [
            { to: publicEthAddress, amount: '100' },
            { to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', amount: '200' },
          ],
          auth: {
            privateKey: privateEthKey,
          },
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);

      const redacted = violation?.redactedParams;
      // Recipients are preserved exactly as original
      expect(redacted?.recipients[0].to).toBe(publicEthAddress);
      expect(redacted?.recipients[1].to).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      // Private key is securely redacted
      expect(redacted?.auth.privateKey).toBe('[REDACTED_WEB3_KEY]');
    });
  });
});
