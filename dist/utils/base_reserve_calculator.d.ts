/**
 * BaseReserveCalculator - Stellar account minimum balance and reserve requirements.
 */
export interface ReserveParams {
    subentries: number;
    numSponsoring?: number;
    numSponsored?: number;
    sellingLiabilitiesStroops?: bigint;
    baseReserveStroops?: bigint;
}
export declare class BaseReserveCalculator {
    static readonly DEFAULT_BASE_RESERVE_STROOPS = 5000000n;
    static calculateMinimumBalanceStroops(params: ReserveParams): bigint;
    static calculateAvailableBalanceStroops(currentBalanceStroops: bigint, params: ReserveParams): bigint;
    static stroopsToXlm(stroops: bigint): string;
    static xlmToStroops(xlm: string | number): bigint;
}
//# sourceMappingURL=base_reserve_calculator.d.ts.map