/**
 * AssetCodeValidator - Stellar asset code and issuer validator.
 */

export type StellarAssetType = 'native' | 'credit_alphanum4' | 'credit_alphanum12';

export interface ValidatedAsset {
  type: StellarAssetType;
  code: string;
  issuer?: string;
}

export class AssetCodeValidator {
  private static readonly ALPHANUM_REGEX = /^[a-zA-Z0-9]+$/;
  private static readonly STELLAR_ACCOUNT_REGEX = /^G[A-Z2-7]{55}$/;

  public static isNative(code: string): boolean {
    return code === 'XLM' || code === 'native';
  }

  public static validateAssetCode(code: string): StellarAssetType | null {
    if (!code || typeof code !== 'string') return null;
    if (this.isNative(code)) return 'native';
    if (!this.ALPHANUM_REGEX.test(code)) return null;

    if (code.length >= 1 && code.length <= 4) {
      return 'credit_alphanum4';
    }
    if (code.length >= 5 && code.length <= 12) {
      return 'credit_alphanum12';
    }
    return null;
  }

  public static isValidIssuer(issuer: string): boolean {
    if (!issuer || typeof issuer !== 'string') return false;
    return this.STELLAR_ACCOUNT_REGEX.test(issuer);
  }

  public static parse(assetString: string): ValidatedAsset | null {
    if (!assetString || typeof assetString !== 'string') return null;
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
      if (!type || type === 'native') return null;
      if (!this.isValidIssuer(issuer)) return null;

      return { type, code, issuer };
    }

    return null;
  }
}
