export type StellarNetworkType = 'Public' | 'Testnet' | 'Standalone' | 'Custom';
export declare class StellarNetworkPassphraseDetector {
    static readonly PUBLIC_PASSPHRASE = "Public Global Stellar Network ; September 2015";
    static readonly TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
    static readonly STANDALONE_PASSPHRASE = "Standalone Network ; February 2017";
    static detect(passphrase: string): StellarNetworkType;
}
//# sourceMappingURL=stellar_network_passphrase_detector.d.ts.map