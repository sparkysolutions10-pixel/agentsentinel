/**
 * AssetCodeValidator - Stellar asset code and issuer validator.
 */
export type StellarAssetType = 'native' | 'credit_alphanum4' | 'credit_alphanum12';
export interface ValidatedAsset {
    type: StellarAssetType;
    code: string;
    issuer?: string;
}
export declare class AssetCodeValidator {
    private static readonly ALPHANUM_REGEX;
    private static readonly STELLAR_ACCOUNT_REGEX;
    static isNative(code: string): boolean;
    static validateAssetCode(code: string): StellarAssetType | null;
    static isValidIssuer(issuer: string): boolean;
    static parse(assetString: string): ValidatedAsset | null;
}
//# sourceMappingURL=asset_code_validator.d.ts.map