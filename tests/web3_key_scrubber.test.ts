import { describe, it, expect } from 'vitest';
import {
  detectWeb3Keys,
  scrubWeb3Keys,
  maskWeb3Key,
  createWeb3KeyScrubberRule,
} from '../src/secrets/web3_key_scrubber.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Web3 Key Scrubber', () => {
  const ethPrivateKeyWith0x = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f3608a9';
  const ethPrivateKeyRaw = '4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f3608a9';
  const ethPublicAddress = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'; // 40 hex chars
  const stellarSecretSeed = 'SCVLSUA5NI6TXY77H4376W3G45S32W5N722P7U5T3N7N2P675E2O3K7B'; // Starts with S, 56 chars
  const stellarPublicAccount = 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A'; // Starts with G, 56 chars
  const btcWIF = '5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ'; // 51 chars

  describe('detectWeb3Keys', () => {
    it('detects Ethereum 64-hex private key with 0x prefix', () => {
      const text = `const signer = new Wallet("${ethPrivateKeyWith0x}");`;
      const matches = detectWeb3Keys(text);
      expect(matches).toHaveLength(1);
      expect(matches[0].chain).toBe('Ethereum');
      expect(matches[0].keyType).toBe('EthereumPrivateKey');
      expect(matches[0].rawKey).toBe(ethPrivateKeyWith0x);
    });

    it('detects Ethereum private key from environment assignment without 0x prefix', () => {
      const text = `ETH_PRIVATE_KEY="${ethPrivateKeyRaw}"`;
      const matches = detectWeb3Keys(text);
      expect(matches).toHaveLength(1);
      expect(matches[0].chain).toBe('Ethereum');
      expect(matches[0].rawKey).toBe(ethPrivateKeyRaw);
    });

    it('detects Stellar Secret Seed (starts with S)', () => {
      const text = `stellar_seed = "${stellarSecretSeed}"`;
      const matches = detectWeb3Keys(text);
      expect(matches).toHaveLength(1);
      expect(matches[0].chain).toBe('Stellar');
      expect(matches[0].keyType).toBe('StellarSecretSeed');
      expect(matches[0].rawKey).toBe(stellarSecretSeed);
    });

    it('detects Bitcoin WIF private key', () => {
      const text = `Importing WIF key: ${btcWIF}`;
      const matches = detectWeb3Keys(text);
      expect(matches).toHaveLength(1);
      expect(matches[0].chain).toBe('Bitcoin');
      expect(matches[0].keyType).toBe('BitcoinWIF');
    });

    it('does not flag Ethereum public addresses (40 hex chars)', () => {
      const text = `Transfer to recipient: ${ethPublicAddress}`;
      const matches = detectWeb3Keys(text);
      expect(matches).toHaveLength(0);
    });

    it('does not flag Stellar public accounts (starts with G)', () => {
      const text = `Destination account: ${stellarPublicAccount}`;
      const matches = detectWeb3Keys(text);
      expect(matches).toHaveLength(0);
    });
  });

  describe('maskWeb3Key', () => {
    it('masks Ethereum private key', () => {
      const masked = maskWeb3Key(ethPrivateKeyWith0x, 'Ethereum');
      expect(masked).toBe('0x***08a9');
    });

    it('masks Stellar secret seed', () => {
      const masked = maskWeb3Key(stellarSecretSeed, 'Stellar');
      expect(masked).toBe('S***3K7B');
    });
  });

  describe('scrubWeb3Keys', () => {
    it('scrubs keys in configuration strings', () => {
      const input = `ETH_KEY=${ethPrivateKeyWith0x}\nSTELLAR_KEY=${stellarSecretSeed}`;
      const result = scrubWeb3Keys(input);
      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).not.toContain(ethPrivateKeyWith0x);
      expect(result.scrubbedText).not.toContain(stellarSecretSeed);
      expect(result.scrubbedText).toContain('0x***08a9');
      expect(result.scrubbedText).toContain('S***3K7B');
    });

    it('supports custom replacement token', () => {
      const input = `KEY="${ethPrivateKeyWith0x}"`;
      const result = scrubWeb3Keys(input, { replacement: '[REDACTED_CRYPTO_KEY]' });
      expect(result.scrubbedText).toBe('KEY="[REDACTED_CRYPTO_KEY]"');
    });
  });

  describe('createWeb3KeyScrubberRule', () => {
    const rule = createWeb3KeyScrubberRule();

    it('allows public addresses in transaction calls', () => {
      const ctx: ToolCallContext = {
        id: 'web3-public',
        toolName: 'send_transaction',
        params: {
          to: ethPublicAddress,
          stellarDestination: stellarPublicAccount,
          value: '1.5',
        },
        timestamp: Date.now(),
      };
      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('blocks tool calls containing private keys in parameters', () => {
      const ctx: ToolCallContext = {
        id: 'web3-private',
        toolName: 'sign_transaction',
        params: {
          privateKey: ethPrivateKeyWith0x,
        },
        timestamp: Date.now(),
      };
      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('Disallowed Web3 private key leaked');
    });

    it('redacts private keys when in redact mode', () => {
      const redactRule = createWeb3KeyScrubberRule({ mode: 'redact' });
      const ctx: ToolCallContext = {
        id: 'web3-redact',
        toolName: 'save_config',
        params: {
          env: {
            SECRET_SEED: stellarSecretSeed,
          },
        },
        timestamp: Date.now(),
      };
      const violation = redactRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);
      expect(violation?.redactedParams?.env.SECRET_SEED).toBe('[REDACTED_WEB3_KEY]');
    });
  });
});
