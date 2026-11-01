export type StellarNetworkType = 'Public' | 'Testnet' | 'Standalone' | 'Custom';

export class StellarNetworkPassphraseDetector {
  public static readonly PUBLIC_PASSPHRASE = 'Public Global Stellar Network ; September 2015';
  public static readonly TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
  public static readonly STANDALONE_PASSPHRASE = 'Standalone Network ; February 2017';

  public static detect(passphrase: string): StellarNetworkType {
    if (!passphrase) return 'Custom';
    const clean = passphrase.trim();
    if (clean === this.PUBLIC_PASSPHRASE) return 'Public';
    if (clean === this.TESTNET_PASSPHRASE) return 'Testnet';
    if (clean === this.STANDALONE_PASSPHRASE) return 'Standalone';
    return 'Custom';
  }
}
