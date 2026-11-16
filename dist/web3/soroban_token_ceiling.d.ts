/**
 * AgentSentinel - SEP-41 Token Transfer Amount Ceiling Rule
 * Enforces strict transfer amount ceilings per transaction on Soroban & Stellar tokens
 * to protect autonomous AI agents from wallet drainage and unauthorized large asset outflows.
 */
import { SentinelRule } from '../types.js';
export interface SorobanTokenCeilingConfig {
    maxTransferAmount?: number;
    whitelistedRecipients?: string[];
}
export declare function createSorobanTokenTransferCeilingRule(config?: SorobanTokenCeilingConfig): SentinelRule;
//# sourceMappingURL=soroban_token_ceiling.d.ts.map