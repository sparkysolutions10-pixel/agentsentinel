/**
 * AgentSentinel - DNS Rebinding & Internal Subnet SSRF Shield
 * Validates Horizon & Soroban RPC endpoint hostnames to block private IP ranges,
 * loopback interfaces (127.0.0.1), and cloud metadata endpoints (169.254.169.254).
 */
import { SentinelRule } from '../types.js';
export declare function createDnsRebindingShieldRule(): SentinelRule;
//# sourceMappingURL=dns_rebinding_shield.d.ts.map