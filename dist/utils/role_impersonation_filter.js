/**
 * AgentSentinel - Role Impersonation Filter Utility
 * Detects adversarial prompt patterns attempting role confusion or instruction resets.
 */
export class RoleImpersonationFilter {
    static INJECTION_PATTERNS = [
        /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
        /disregard\s+(all\s+)?(previous|prior)\s+rules/i,
        /^[\s\r\n]*(system|developer|admin)\s*:/im,
        /\[system\s+prompt\s+override\]/i,
        /you\s+are\s+now\s+in\s+(dan|unrestricted|god)\s+mode/i,
        /jailbreak\s+active/i
    ];
    static isImpersonating(prompt) {
        if (!prompt || typeof prompt !== 'string')
            return false;
        for (const pattern of this.INJECTION_PATTERNS) {
            if (pattern.test(prompt)) {
                return true;
            }
        }
        return false;
    }
}
//# sourceMappingURL=role_impersonation_filter.js.map