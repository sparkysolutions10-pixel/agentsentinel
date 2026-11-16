/**
 * AgentSentinel - URL Query Parameter Sanitizer Utility
 * Strips sensitive API keys, tokens, and credentials from URLs before audit logging.
 */
export declare class UrlQueryParamSanitizer {
    private static readonly SENSITIVE_KEY_REGEX;
    static sanitize(urlStr: string, redactor?: string): string;
}
//# sourceMappingURL=url_query_param_sanitizer.d.ts.map