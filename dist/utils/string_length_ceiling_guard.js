/**
 * AgentSentinel - String Length Ceiling Guard Utility
 * Bounds maximum string length and formats clean ellipsis previews.
 */
export class StringLengthCeilingGuard {
    static isWithinCeiling(str, maxChars = 1000) {
        if (typeof str !== 'string')
            return false;
        return str.length <= maxChars;
    }
    static truncate(str, maxChars = 100, suffix = '...') {
        if (!str || typeof str !== 'string')
            return '';
        if (str.length <= maxChars)
            return str;
        const targetLen = Math.max(0, maxChars - suffix.length);
        return str.substring(0, targetLen) + suffix;
    }
}
//# sourceMappingURL=string_length_ceiling_guard.js.map