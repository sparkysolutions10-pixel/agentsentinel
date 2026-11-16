export class StellarMuxedAccountParser {
    static isMuxed(address) {
        if (!address || typeof address !== 'string')
            return false;
        return address.startsWith('M') && address.length === 69;
    }
}
//# sourceMappingURL=stellar_muxed_account_parser.js.map