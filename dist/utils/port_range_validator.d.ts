/**
 * AgentSentinel - Port Range Validator Utility
 * Validates TCP/UDP ports and matches target ports against configured range specifications.
 */
export declare class PortRangeValidator {
    static isValidPort(port: number): boolean;
    static parseRanges(rangeSpec: string): number[];
    static isPortAllowed(port: number, allowedSpec: string): boolean;
}
//# sourceMappingURL=port_range_validator.d.ts.map