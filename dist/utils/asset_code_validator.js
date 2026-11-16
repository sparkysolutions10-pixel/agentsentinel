/**
 * AssetCodeValidator - Stellar asset code and issuer validator.
 */
export class AssetCodeValidator {
    static ALPHANUM_REGEX = /^[a-zA-Z0-9]+$/;
    static STELLAR_ACCOUNT_REGEX = /^G[A-Z2-7]{55}$/;
    static isNative(code) {
        return code === 'XLM' || code === 'native';
    }
    static validateAssetCode(code) {
        if (!code || typeof code !== 'string')
            return null;
        if (this.isNative(code))
            return 'native';
        if (!this.ALPHANUM_REGEX.test(code))
            return null;
        if (code.length >= 1 && code.length <= 4) {
            return 'credit_alphanum4';
        }
        if (code.length >= 5 && code.length <= 12) {
            return 'credit_alphanum12';
        }
        return null;
    }
    static isValidIssuer(issuer) {
        if (!issuer || typeof issuer !== 'string')
            return false;
        return this.STELLAR_ACCOUNT_REGEX.test(issuer);
    }
    static parse(assetString) {
        if (!assetString || typeof assetString !== 'string')
            return null;
        const parts = assetString.trim().split(':');
        if (parts.length === 1) {
            if (this.isNative(parts[0])) {
                return { type: 'native', code: 'XLM' };
            }
            return null;
        }
        if (parts.length === 2) {
            const [code, issuer] = parts;
            const type = this.validateAssetCode(code);
            if (!type || type === 'native')
                return null;
            if (!this.isValidIssuer(issuer))
                return null;
            return { type, code, issuer };
        }
        return null;
    }
}
//# sourceMappingURL=asset_code_validator.js.map