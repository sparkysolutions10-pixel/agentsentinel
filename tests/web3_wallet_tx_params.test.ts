import { describe, it, expect } from 'vitest';
import {
  detectWeb3Keys,
  scrubWeb3Keys,
  createWeb3KeyScrubberRule,
} from '../src/secrets/web3_key_scrubber.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Web3 Private Key Scrubbing on Wallet Transaction Parameters', () => {
  const ethPrivateKey = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f3608a9';
  const ethRecipient = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth
  const ethSender = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
  const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  const stellarSecretSeed = 'SCVLSUA5NI6TXY77H4376W3G45S32W5N722P7U5T3N7N2P675E2O3K7B';
  const stellarSource = 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';
  const stellarDestination = 'GCKG5WGBIJP74UDNRDAQ5POQGSQCPMA2UD2TTRGIBWOLQQ2HSA5TV227';

  describe('Ethereum Wallet & JSON-RPC Calls', () => {
    const rule = createWeb3KeyScrubberRule({ mode: 'redact' });

    it('redacts signer privateKey while preserving sender, recipient, and calldata', () => {
      const ctx: ToolCallContext = {
        id: 'eth-tx-1',
        toolName: 'eth_sendTransaction',
        params: {
          from: ethSender,
          to: ethRecipient,
          value: '1000000000000000000', // 1 ETH in wei
          data: '0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
          signer: {
            privateKey: ethPrivateKey,
          },
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);

      const params = violation?.redactedParams;
      expect(params?.from).toBe(ethSender);
      expect(params?.to).toBe(ethRecipient);
      expect(params?.signer.privateKey).toBe('[REDACTED_WEB3_KEY]');
      expect(params?.value).toBe('1000000000000000000');
    });

    it('does not redact or flag public transaction hashes in receipts or queries', () => {
      const ctx: ToolCallContext = {
        id: 'eth-query-receipt',
        toolName: 'eth_getTransactionReceipt',
        params: {
          txHash: txHash,
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });
  });

  describe('Stellar Horizon Payment Transactions', () => {
    const rule = createWeb3KeyScrubberRule({ mode: 'redact' });

    it('redacts secretSeed while preserving source and destination public addresses', () => {
      const ctx: ToolCallContext = {
        id: 'stellar-pay-1',
        toolName: 'stellar_payment',
        params: {
          sourceAccount: stellarSource,
          destinationAccount: stellarDestination,
          amount: '50.00',
          asset: 'XLM',
          auth: {
            secretKey: stellarSecretSeed,
          },
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);

      const params = violation?.redactedParams;
      expect(params?.sourceAccount).toBe(stellarSource);
      expect(params?.destinationAccount).toBe(stellarDestination);
      expect(params?.auth.secretKey).toBe('[REDACTED_WEB3_KEY]');
    });
  });

  describe('Ethers.js / Viem Contract Deployment Scenarios', () => {
    const blockRule = createWeb3KeyScrubberRule({ mode: 'block' });

    it('blocks deployment tool call with exposed private key in environment or arguments', () => {
      const ctx: ToolCallContext = {
        id: 'contract-deploy',
        toolName: 'hardhat_deploy',
        params: {
          network: 'mainnet',
          contract: 'ERC20Token',
          env: {
            DEPLOYER_PRIVATE_KEY: ethPrivateKey,
          },
        },
        timestamp: Date.now(),
      };

      const violation = blockRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('Ethereum');
      expect(violation?.reason).toContain('env.DEPLOYER_PRIVATE_KEY');
    });
  });

  describe('Multi-Chain Batch Operations', () => {
    it('simultaneously scrubs Ethereum and Stellar credentials in batch parameter arrays', () => {
      const payload = {
        wallets: [
          { chain: 'eth', key: ethPrivateKey, addr: ethSender },
          { chain: 'stellar', key: stellarSecretSeed, addr: stellarSource },
        ],
      };

      const jsonStr = JSON.stringify(payload);
      const scrubbed = scrubWeb3Keys(jsonStr);

      expect(scrubbed.hasMatches).toBe(true);
      expect(scrubbed.scrubbedText).not.toContain(ethPrivateKey);
      expect(scrubbed.scrubbedText).not.toContain(stellarSecretSeed);
      expect(scrubbed.scrubbedText).toContain(ethSender);
      expect(scrubbed.scrubbedText).toContain(stellarSource);
    });
  });
});
