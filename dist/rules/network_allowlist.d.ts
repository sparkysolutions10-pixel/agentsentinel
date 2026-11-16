/**
 * AgentSentinel Outbound Network Destination IP & Domain Allowlist Rule.
 * Prevents unauthorized data exfiltration, SSRF attacks, and rogue webhooks
 * by verifying outbound URLs and hostnames against a strict enterprise allowlist.
 */
import { SentinelRule, ToolCallContext, RuleViolation } from '../types.js';
export interface NetworkAllowlistOptions {
    allowedDomains?: string[];
    allowedIps?: string[];
    allowLocalhost?: boolean;
    urlParamKeys?: string[];
    action?: 'BLOCK' | 'CONFIRM';
}
export interface NetworkDestinationValidation {
    allowed: boolean;
    destination?: string;
    reason?: string;
    isExfiltrationRisk?: boolean;
}
export declare class NetworkAllowlistGuard {
    private allowedDomains;
    private allowedIps;
    private allowLocalhost;
    private urlParamKeys;
    private action;
    constructor(options?: NetworkAllowlistOptions);
    /**
     * Matches a hostname against an allowlist pattern, supporting leading wildcard (*.domain.com).
     */
    matchesPattern(hostname: string, pattern: string): boolean;
    /**
     * Extracts target URLs or hostnames from deeply nested tool parameters.
     */
    extractDestinations(params: Record<string, any>): string[];
    /**
     * Validates a destination string (URL or hostname) against configured network policies.
     */
    validateDestination(raw: string): NetworkDestinationValidation;
    /**
     * Evaluates a ToolCallContext against the outbound destination allowlist.
     */
    evaluateContext(ctx: ToolCallContext): RuleViolation | null;
    /**
     * Creates an AgentSentinel SentinelRule for outbound network allowlist.
     */
    createSentinelRule(): SentinelRule;
}
export declare function createNetworkAllowlistRule(options?: NetworkAllowlistOptions): SentinelRule;
//# sourceMappingURL=network_allowlist.d.ts.map