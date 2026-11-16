export class Bip39MnemonicValidator {
    static VALID_LENGTHS = new Set([12, 15, 18, 21, 24]);
    static isValid(phrase) {
        if (!phrase || typeof phrase !== 'string')
            return false;
        const words = phrase.trim().toLowerCase().split(/\s+/);
        if (!this.VALID_LENGTHS.has(words.length)) {
            return false;
        }
        // Check that every word contains only lowercase a-z
        return words.every(w => /^[a-z]{3,8}$/.test(w));
    }
    static getWordCount(phrase) {
        if (!phrase || typeof phrase !== 'string')
            return 0;
        return phrase.trim().split(/\s+/).filter(Boolean).length;
    }
}
//# sourceMappingURL=bip39_mnemonic_validator.js.map