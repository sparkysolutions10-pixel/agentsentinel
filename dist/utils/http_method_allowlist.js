/**
 * AgentSentinel - HTTP Method Allowlist Utility
 * Validates and restricts HTTP request methods to enforce zero-trust tool call policies.
 */
export class HttpMethodAllowlist {
    static STANDARD_SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
    static isValid(method, allowed = ['GET', 'POST']) {
        if (!method || typeof method !== 'string')
            return false;
        const norm = method.trim().toUpperCase();
        const upperAllowed = allowed.map(m => m.trim().toUpperCase());
        return upperAllowed.includes(norm);
    }
    static isSafeMethod(method) {
        if (!method || typeof method !== 'string')
            return false;
        return this.STANDARD_SAFE_METHODS.includes(method.trim().toUpperCase());
    }
}
//# sourceMappingURL=http_method_allowlist.js.map