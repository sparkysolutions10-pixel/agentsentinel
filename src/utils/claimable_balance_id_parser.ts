/**
 * ClaimableBalanceIdParser - Stellar Claimable Balance ID format parsing and validation.
 */

export interface ParsedClaimableBalanceId {
  rawId: string;
  balanceType: 'claimable_balance_id_type_v0' | 'unknown';
  typeHex: string;
  hashHex: string;
}

export class ClaimableBalanceIdParser {
  private static readonly CLAIMABLE_BALANCE_REGEX = /^[0-9a-f]{72}$/i;

  public static isValid(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    return this.CLAIMABLE_BALANCE_REGEX.test(id.trim());
  }

  public static parse(id: string): ParsedClaimableBalanceId | null {
    if (!this.isValid(id)) return null;

    const normalized = id.trim().toLowerCase();
    const typeHex = normalized.slice(0, 8);
    const hashHex = normalized.slice(8);

    let balanceType: 'claimable_balance_id_type_v0' | 'unknown' = 'unknown';
    if (typeHex === '00000000') {
      balanceType = 'claimable_balance_id_type_v0';
    }

    return {
      rawId: normalized,
      balanceType,
      typeHex,
      hashHex
    };
  }
}
