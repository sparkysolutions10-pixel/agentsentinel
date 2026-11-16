/**
 * AgentSentinel - Bridge Mint Reserve Invariant Checker
 * Enforces the strict invariant that cross-chain minted wrapped tokens
 * must never exceed verified locked reserves on the underlying native chain.
 */
import { SentinelRule } from '../types.js';
export interface BridgeMintInvariantConfig {
    maxMintRatio?: number;
    staticLockedReserve?: number;
}
export declare function createBridgeMintInvariantRule(config?: BridgeMintInvariantConfig): SentinelRule;
//# sourceMappingURL=bridge_mint_invariant.d.ts.map