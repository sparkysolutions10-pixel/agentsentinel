/**
 * ClaimableBalanceIdParser - Stellar Claimable Balance ID format parsing and validation.
 */
export interface ParsedClaimableBalanceId {
    rawId: string;
    balanceType: 'claimable_balance_id_type_v0' | 'unknown';
    typeHex: string;
    hashHex: string;
}
export declare class ClaimableBalanceIdParser {
    private static readonly CLAIMABLE_BALANCE_REGEX;
    static isValid(id: string): boolean;
    static parse(id: string): ParsedClaimableBalanceId | null;
}
//# sourceMappingURL=claimable_balance_id_parser.d.ts.map