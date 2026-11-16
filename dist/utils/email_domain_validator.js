export class EmailDomainValidator {
    static EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    static DISPOSABLE_DOMAINS = new Set([
        'mailinator.com',
        'tempmail.com',
        '10minutemail.com',
        'guerrillamail.com',
        'throwawaymail.com',
        'yopmail.com'
    ]);
    static isValid(email, options = {}) {
        if (!email || typeof email !== 'string' || email.length > 254) {
            return false;
        }
        const trimmed = email.trim().toLowerCase();
        if (!this.EMAIL_REGEX.test(trimmed)) {
            return false;
        }
        const parts = trimmed.split('@');
        if (parts.length !== 2) {
            return false;
        }
        const domain = parts[1];
        if (options.blockDisposable && this.DISPOSABLE_DOMAINS.has(domain)) {
            return false;
        }
        if (options.blockedDomains && options.blockedDomains.some(d => d.toLowerCase() === domain)) {
            return false;
        }
        if (options.allowedDomains && options.allowedDomains.length > 0) {
            return options.allowedDomains.some(d => d.toLowerCase() === domain);
        }
        return true;
    }
    static extractDomain(email) {
        if (!email || typeof email !== 'string')
            return null;
        const parts = email.trim().toLowerCase().split('@');
        return parts.length === 2 && parts[1] ? parts[1] : null;
    }
}
//# sourceMappingURL=email_domain_validator.js.map