export class StellarNetworkPassphraseDetector {
    static PUBLIC_PASSPHRASE = 'Public Global Stellar Network ; September 2015';
    static TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
    static STANDALONE_PASSPHRASE = 'Standalone Network ; February 2017';
    static detect(passphrase) {
        if (!passphrase)
            return 'Custom';
        const clean = passphrase.trim();
        if (clean === this.PUBLIC_PASSPHRASE)
            return 'Public';
        if (clean === this.TESTNET_PASSPHRASE)
            return 'Testnet';
        if (clean === this.STANDALONE_PASSPHRASE)
            return 'Standalone';
        return 'Custom';
    }
}
//# sourceMappingURL=stellar_network_passphrase_detector.js.map