/**
 * AgentSentinel - Soroban Strict Security Policy Preset Loader
 * Loads and registers standardized enterprise Web3 security presets
 * for Soroban smart contracts and Stellar decentralized operations.
 */
import { SentinelEngine } from '../index.js';
export interface SorobanStrictPresetOptions {
    maxFootprintKeys?: number;
    maxSlippagePercent?: number;
    maxTransferAmount?: number;
}
export declare function loadSorobanStrictPreset(engine: SentinelEngine, options?: SorobanStrictPresetOptions): SentinelEngine;
//# sourceMappingURL=soroban_preset_loader.d.ts.map