import { describe, it, expect } from 'vitest';
import { StellarNetworkPassphraseDetector } from '../src/utils/stellar_network_passphrase_detector.js';

describe('StellarNetworkPassphraseDetector', () => {
  it('detects standard Stellar network passphrases', () => {
    expect(StellarNetworkPassphraseDetector.detect('Public Global Stellar Network ; September 2015')).toBe('Public');
    expect(StellarNetworkPassphraseDetector.detect('Test SDF Network ; September 2015')).toBe('Testnet');
    expect(StellarNetworkPassphraseDetector.detect('custom')).toBe('Custom');
  });
});
