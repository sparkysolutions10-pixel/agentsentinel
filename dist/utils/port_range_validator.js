/**
 * AgentSentinel - Port Range Validator Utility
 * Validates TCP/UDP ports and matches target ports against configured range specifications.
 */
export class PortRangeValidator {
    static isValidPort(port) {
        return Number.isInteger(port) && port >= 1 && port <= 65535;
    }
    static parseRanges(rangeSpec) {
        if (!rangeSpec || typeof rangeSpec !== 'string')
            return [];
        const ports = new Set();
        const tokens = rangeSpec.split(',');
        for (const token of tokens) {
            const trimmed = token.trim();
            if (trimmed.includes('-')) {
                const [startStr, endStr] = trimmed.split('-');
                const start = parseInt(startStr, 10);
                const end = parseInt(endStr, 10);
                if (this.isValidPort(start) && this.isValidPort(end) && start <= end) {
                    for (let p = start; p <= end; p++) {
                        ports.add(p);
                    }
                }
            }
            else {
                const p = parseInt(trimmed, 10);
                if (this.isValidPort(p)) {
                    ports.add(p);
                }
            }
        }
        return Array.from(ports).sort((a, b) => a - b);
    }
    static isPortAllowed(port, allowedSpec) {
        if (!this.isValidPort(port))
            return false;
        const allowed = this.parseRanges(allowedSpec);
        return allowed.includes(port);
    }
}
//# sourceMappingURL=port_range_validator.js.map