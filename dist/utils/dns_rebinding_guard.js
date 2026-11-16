export class DnsRebindingGuard {
    static BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0', '169.254.169.254']);
    static isForbiddenTarget(host) {
        if (!host || typeof host !== 'string')
            return true;
        const clean = host.trim().toLowerCase();
        if (this.BLOCKED_HOSTS.has(clean))
            return true;
        // Check 10.x.x.x, 192.168.x.x, 172.16-31.x.x
        if (/^10\./.test(clean) || /^192\.168\./.test(clean))
            return true;
        const match172 = clean.match(/^172\.(\d+)\./);
        if (match172) {
            const secondOctet = parseInt(match172[1], 10);
            if (secondOctet >= 16 && secondOctet <= 31)
                return true;
        }
        return false;
    }
}
//# sourceMappingURL=dns_rebinding_guard.js.map