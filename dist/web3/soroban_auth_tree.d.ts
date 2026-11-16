/**
 * AgentSentinel - Soroban Authorization Tree (SorobanAuthorizationEntry) Verifier
 * Validates sub-contract invocation authorization trees, verifying that authorized
 * credentials exist for each leaf and sub-call to prevent unauthorized contract execution.
 */
import { SentinelRule } from '../types.js';
export interface SorobanAuthTreeConfig {
    disallowUnsignedSubInvocations?: boolean;
    maxAuthTreeDepth?: number;
}
export interface AuthEntry {
    credentials?: {
        type?: string;
        address?: string;
        signature?: string;
    };
    rootInvocation?: {
        function?: string;
        subInvocations?: AuthEntry[];
    };
}
export declare function createSorobanAuthTreeVerifierRule(config?: SorobanAuthTreeConfig): SentinelRule;
//# sourceMappingURL=soroban_auth_tree.d.ts.map