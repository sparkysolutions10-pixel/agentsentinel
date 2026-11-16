export class SafeRedirectValidator {
    static isSafe(location, allowedHosts = []) {
        if (!location || typeof location !== 'string')
            return false;
        const trimmed = location.trim();
        // Safe relative redirect
        if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
            return true;
        }
        try {
            const url = new URL(trimmed);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                return false;
            }
            return allowedHosts.some(host => url.hostname.toLowerCase() === host.toLowerCase());
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=safe_redirect_validator.js.map