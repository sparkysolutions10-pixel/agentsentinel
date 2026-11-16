/**
 * AgentSentinel - Soroban Strict Security Policy Preset Loader
 * Loads and registers standardized enterprise Web3 security presets
 * for Soroban smart contracts and Stellar decentralized operations.
 */
import { createSorobanFootprintGuardRule } from './soroban_footprint_guard.js';
import { createSorobanAuthTreeVerifierRule } from './soroban_auth_tree.js';
import { createSorobanReentrancyGuardRule } from './soroban_reentrancy_guard.js';
import { createSorobanSlippageEnforcerRule } from './soroban_slippage_enforcer.js';
import { createSorobanTokenTransferCeilingRule } from './soroban_token_ceiling.js';
import { createSorobanZeroAddressBurnInterceptorRule } from './soroban_zero_address_guard.js';
export function loadSorobanStrictPreset(engine, options = {}) {
    engine.registerRule(createSorobanFootprintGuardRule({ maxFootprintKeys: options.maxFootprintKeys ?? 20 }));
    engine.registerRule(createSorobanAuthTreeVerifierRule());
    engine.registerRule(createSorobanReentrancyGuardRule());
    engine.registerRule(createSorobanSlippageEnforcerRule({ maxSlippagePercent: options.maxSlippagePercent ?? 0.5 }));
    engine.registerRule(createSorobanTokenTransferCeilingRule({ maxTransferAmount: options.maxTransferAmount ?? 10000 }));
    engine.registerRule(createSorobanZeroAddressBurnInterceptorRule());
    return engine;
}
//# sourceMappingURL=soroban_preset_loader.js.map