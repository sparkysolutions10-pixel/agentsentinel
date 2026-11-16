/**
 * AgentSentinel - Core Type Definitions
 * Zero-trust runtime security firewall and AST policy interceptor for AI agents & MCP.
 */
export var Verdict;
(function (Verdict) {
    Verdict["ALLOW"] = "ALLOW";
    Verdict["BLOCK"] = "BLOCK";
    Verdict["REDACT"] = "REDACT";
    Verdict["CONFIRM"] = "CONFIRM";
})(Verdict || (Verdict = {}));
/**
 * Type guard checking if an arbitrary value matches a valid Verdict enum.
 */
export function isVerdict(value) {
    return typeof value === 'string' && Object.values(Verdict).includes(value);
}
/**
 * Asserts that a value is a valid Verdict enum, throwing TypeError otherwise.
 */
export function assertVerdict(value) {
    if (!isVerdict(value)) {
        throw new TypeError(`[AgentSentinel] Invalid verdict value: "${String(value)}". Expected ALLOW, BLOCK, REDACT, or CONFIRM.`);
    }
}
/**
 * Safely parses any case-insensitive string or value into a standardized Verdict enum.
 */
export function parseVerdict(value, fallback = Verdict.BLOCK) {
    if (typeof value === 'string') {
        const normalized = value.trim().toUpperCase();
        if (isVerdict(normalized)) {
            return normalized;
        }
    }
    return fallback;
}
/**
 * Numeric priority ranking of verdicts (higher number = more restrictive).
 */
export function getVerdictRank(verdict) {
    switch (verdict) {
        case Verdict.BLOCK:
            return 4;
        case Verdict.CONFIRM:
            return 3;
        case Verdict.REDACT:
            return 2;
        case Verdict.ALLOW:
            return 1;
        default:
            return 0;
    }
}
//# sourceMappingURL=types.js.map