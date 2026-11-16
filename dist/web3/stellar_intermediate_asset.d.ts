/**
 * AgentSentinel - Intermediate Asset Issuer Trustline Verifier
 * Verifies all intermediate assets along a multi-hop Stellar payment path
 * possess active trustlines, valid issuers, and non-zero orderbook liquidity.
 */
import { SentinelRule } from '../types.js';
export interface StellarIntermediateAssetConfig {
    blockedIssuers?: string[];
}
export declare function createStellarIntermediateAssetTrustlineRule(config?: StellarIntermediateAssetConfig): SentinelRule;
//# sourceMappingURL=stellar_intermediate_asset.d.ts.map