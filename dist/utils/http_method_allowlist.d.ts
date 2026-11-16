/**
 * AgentSentinel - HTTP Method Allowlist Utility
 * Validates and restricts HTTP request methods to enforce zero-trust tool call policies.
 */
export declare class HttpMethodAllowlist {
    private static readonly STANDARD_SAFE_METHODS;
    static isValid(method: string, allowed?: string[]): boolean;
    static isSafeMethod(method: string): boolean;
}
//# sourceMappingURL=http_method_allowlist.d.ts.map