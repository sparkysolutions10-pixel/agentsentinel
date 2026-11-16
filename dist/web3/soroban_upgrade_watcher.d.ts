/**
 * AgentSentinel - Contract Upgrade Event and Migration Watcher
 * Watches for Soroban contract code upgrades (e.g. update_current_contract_wasm invocations)
 * and halts execution if an unverified contract migration is detected.
 */
import { SentinelRule } from '../types.js';
export interface SorobanUpgradeWatcherConfig {
    allowedUpgradeAdmin?: string;
    blockAllUpgrades?: boolean;
}
export declare function createSorobanUpgradeWatcherRule(config?: SorobanUpgradeWatcherConfig): SentinelRule;
//# sourceMappingURL=soroban_upgrade_watcher.d.ts.map