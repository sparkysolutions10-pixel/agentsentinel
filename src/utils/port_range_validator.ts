/**
 * AgentSentinel - Port Range Validator Utility
 * Validates TCP/UDP ports and matches target ports against configured range specifications.
 */

export class PortRangeValidator {
  public static isValidPort(port: number): boolean {
    return Number.isInteger(port) && port >= 1 && port <= 65535;
  }

  public static parseRanges(rangeSpec: string): number[] {
    if (!rangeSpec || typeof rangeSpec !== 'string') return [];
    const ports = new Set<number>();
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
      } else {
        const p = parseInt(trimmed, 10);
        if (this.isValidPort(p)) {
          ports.add(p);
        }
      }
    }

    return Array.from(ports).sort((a, b) => a - b);
  }

  public static isPortAllowed(port: number, allowedSpec: string): boolean {
    if (!this.isValidPort(port)) return false;
    const allowed = this.parseRanges(allowedSpec);
    return allowed.includes(port);
  }
}
