/**
 * AgentSentinel - Contract Address Impersonation and Spoofing Guard
 * Verifies target contract addresses and bytecode hashes against an audited
 * protocol registry to reject spoofed lookalikes, phishing contracts, and malicious clones.
 */
import { SentinelRule } from '../types.js';
export interface SorobanContractRegistryConfig {
    verifiedContracts?: Record<string, string>;
    disallowUnregisteredKnownProtocols?: boolean;
}
export declare function createSorobanContractSpoofingGuardRule(config?: SorobanContractRegistryConfig): SentinelRule;
//# sourceMappingURL=soroban_contract_spoofing_guard.d.ts.map