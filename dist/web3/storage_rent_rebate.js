/**
 * AgentSentinel - Soroban Storage Rent Rebate Calculator
 * Computes estimated Stroop fee refunds when persistent storage keys are deleted,
 * incentivizing automated storage garbage collection in agent architectures.
 */
export class StorageRentRebateCalculator {
    feePerByteLedger;
    constructor(config = {}) {
        this.feePerByteLedger = config.feePerByteLedgerStroops ?? 0.0001;
    }
    calculateRebateStroops(keyBytes, remainingLedgers) {
        if (keyBytes <= 0 || remainingLedgers <= 0) {
            return 0;
        }
        return Math.floor(keyBytes * remainingLedgers * this.feePerByteLedger);
    }
}
//# sourceMappingURL=storage_rent_rebate.js.map