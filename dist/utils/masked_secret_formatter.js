export class MaskedSecretFormatter {
    static mask(secret, visiblePrefixLen = 4, visibleSuffixLen = 4) {
        if (!secret || typeof secret !== 'string')
            return '';
        const clean = secret.trim();
        if (clean.length <= visiblePrefixLen + visibleSuffixLen) {
            return '*'.repeat(clean.length);
        }
        const prefix = clean.substring(0, visiblePrefixLen);
        const suffix = clean.substring(clean.length - visibleSuffixLen);
        const maskedLen = Math.max(4, clean.length - (visiblePrefixLen + visibleSuffixLen));
        return `${prefix}${'*'.repeat(maskedLen)}${suffix}`;
    }
}
//# sourceMappingURL=masked_secret_formatter.js.map