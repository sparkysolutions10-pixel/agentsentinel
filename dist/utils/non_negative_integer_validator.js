/**
 * AgentSentinel - Non-Negative Integer Validator Utility
 * Validates non-negative integer parameter bounds and provides ceiling clamping.
 */
export class NonNegativeIntegerValidator {
    static isValid(val, max) {
        if (typeof val !== 'number' || !Number.isInteger(val) || val < 0) {
            return false;
        }
        if (max !== undefined && val > max) {
            return false;
        }
        return true;
    }
    static clamp(val, max) {
        if (!Number.isFinite(val) || val < 0)
            return 0;
        const intVal = Math.floor(val);
        return Math.min(intVal, max);
    }
}
//# sourceMappingURL=non_negative_integer_validator.js.map