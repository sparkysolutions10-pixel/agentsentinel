/**
 * TimeboundsValidator - Stellar transaction timebounds validation.
 */
export class TimeboundsValidator {
    static isValidTimebounds(tb) {
        try {
            const min = BigInt(tb.minTime);
            const max = BigInt(tb.maxTime);
            if (min < 0n || max < 0n)
                return false;
            // maxTime 0 means no upper bound
            if (max !== 0n && min > max)
                return false;
            return true;
        }
        catch {
            return false;
        }
    }
    static isWithinTimebounds(tb, currentUnixTimeSeconds = Math.floor(Date.now() / 1000)) {
        if (!this.isValidTimebounds(tb))
            return false;
        const current = BigInt(currentUnixTimeSeconds);
        const min = BigInt(tb.minTime);
        const max = BigInt(tb.maxTime);
        if (current < min)
            return false;
        if (max !== 0n && current > max)
            return false;
        return true;
    }
}
//# sourceMappingURL=timebounds_validator.js.map