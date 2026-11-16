/**
 * TimeboundsValidator - Stellar transaction timebounds validation.
 */
export interface Timebounds {
    minTime: number | string | bigint;
    maxTime: number | string | bigint;
}
export declare class TimeboundsValidator {
    static isValidTimebounds(tb: Timebounds): boolean;
    static isWithinTimebounds(tb: Timebounds, currentUnixTimeSeconds?: number): boolean;
}
//# sourceMappingURL=timebounds_validator.d.ts.map