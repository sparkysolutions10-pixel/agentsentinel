/**
 * AgentSentinel - Float Precision Clamp Utility
 * Enforces decimal precision bounds on floating-point numbers for financial safety.
 */
export class FloatPrecisionClamp {
    static round(val, decimals = 2) {
        if (!Number.isFinite(val))
            return 0;
        const factor = Math.pow(10, decimals);
        return Math.round(val * factor) / factor;
    }
    static hasValidPrecision(val, maxDecimals) {
        if (!Number.isFinite(val))
            return false;
        const str = val.toString();
        const parts = str.split('.');
        if (parts.length === 1)
            return true;
        return parts[1].length <= maxDecimals;
    }
}
//# sourceMappingURL=float_precision_clamp.js.map