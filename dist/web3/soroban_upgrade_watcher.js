/**
 * AgentSentinel - Contract Upgrade Event and Migration Watcher
 * Watches for Soroban contract code upgrades (e.g. update_current_contract_wasm invocations)
 * and halts execution if an unverified contract migration is detected.
 */
import { Verdict } from '../types.js';
export function createSorobanUpgradeWatcherRule(config = {}) {
    const allowedAdmin = config.allowedUpgradeAdmin?.toUpperCase();
    const blockAll = config.blockAllUpgrades ?? false;
    return {
        id: 'soroban-upgrade-watcher',
        name: 'Soroban Contract Upgrade & Migration Watcher',
        category: 'custom',
        priority: 92,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('upgrade') && !tool.includes('migrate') && !tool.includes('soroban') && !tool.includes('wasm')) {
                return null;
            }
            const params = context.params || {};
            const method = String(params.method || params.fn || tool).toLowerCase();
            const isUpgrade = method.includes('upgrade') ||
                method.includes('update_current_contract_wasm') ||
                method.includes('migrate');
            if (!isUpgrade) {
                return null;
            }
            if (blockAll) {
                return {
                    ruleId: 'soroban-upgrade-watcher',
                    ruleName: 'Soroban Contract Upgrade & Migration Watcher',
                    severity: 'critical',
                    verdict: Verdict.BLOCK,
                    reason: 'Policy forbids all live contract bytecode upgrades.',
                    detectedPattern: 'CONTRACT_UPGRADE_FORBIDDEN',
                };
            }
            const caller = String(params.caller || params.admin || params.source || '').toUpperCase();
            if (allowedAdmin && caller !== allowedAdmin) {
                return {
                    ruleId: 'soroban-upgrade-watcher',
                    ruleName: 'Soroban Contract Upgrade & Migration Watcher',
                    severity: 'critical',
                    verdict: Verdict.BLOCK,
                    reason: `Unauthorized caller (${caller}) attempted contract upgrade. Authorized upgrade admin is (${allowedAdmin}).`,
                    detectedPattern: `UNAUTHORIZED_UPGRADE_ADMIN:${caller}!=${allowedAdmin}`,
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=soroban_upgrade_watcher.js.map