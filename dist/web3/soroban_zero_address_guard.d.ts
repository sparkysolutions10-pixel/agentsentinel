/**
 * AgentSentinel - Zero-Address and Burn Address Transfer Interceptor
 * Intercepts and blocks accidental asset transfers directed to zero-addresses or known burn destinations
 * on Soroban contracts and Stellar accounts.
 */
import { SentinelRule } from '../types.js';
export interface SorobanZeroAddressConfig {
    allowedExplicitBurnMethods?: string[];
}
export declare function createSorobanZeroAddressBurnInterceptorRule(config?: SorobanZeroAddressConfig): SentinelRule;
//# sourceMappingURL=soroban_zero_address_guard.d.ts.map