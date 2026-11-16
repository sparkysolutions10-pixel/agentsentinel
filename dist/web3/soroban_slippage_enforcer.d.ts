/**
 * AgentSentinel - Decentralized Exchange Maximum Slippage Enforcer
 * Enforces strict slippage tolerance (default 0.5%) on Soroban AMM swap transactions
 * to shield autonomous AI agents from MEV sandwiching and excessive price impact.
 */
import { SentinelRule } from '../types.js';
export interface SorobanSlippageConfig {
    maxSlippagePercent?: number;
}
export declare function createSorobanSlippageEnforcerRule(config?: SorobanSlippageConfig): SentinelRule;
//# sourceMappingURL=soroban_slippage_enforcer.d.ts.map