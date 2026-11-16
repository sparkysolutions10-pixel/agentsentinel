/**
 * Validates email addresses and filters disposable or unauthorized domains.
 */
export interface EmailValidationOptions {
    allowedDomains?: string[];
    blockedDomains?: string[];
    blockDisposable?: boolean;
}
export declare class EmailDomainValidator {
    private static readonly EMAIL_REGEX;
    private static readonly DISPOSABLE_DOMAINS;
    static isValid(email: string, options?: EmailValidationOptions): boolean;
    static extractDomain(email: string): string | null;
}
//# sourceMappingURL=email_domain_validator.d.ts.map