/**
 * TrustlineLimitValidator - Stellar trustline limit validation and int64 boundary enforcement.
 */
export declare class TrustlineLimitValidator {
    static readonly MAX_INT64_STROOPS = 9223372036854775807n;
    static isValidLimit(limitStr: string): boolean;
    static isClosingTrustline(limitStr: string): boolean;
}
//# sourceMappingURL=trustline_limit_validator.d.ts.map