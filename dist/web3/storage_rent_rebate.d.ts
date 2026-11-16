/**
 * AgentSentinel - Soroban Storage Rent Rebate Calculator
 * Computes estimated Stroop fee refunds when persistent storage keys are deleted,
 * incentivizing automated storage garbage collection in agent architectures.
 */
export interface RebateConfig {
    feePerByteLedgerStroops?: number;
}
export declare class StorageRentRebateCalculator {
    private feePerByteLedger;
    constructor(config?: RebateConfig);
    calculateRebateStroops(keyBytes: number, remainingLedgers: number): number;
}
//# sourceMappingURL=storage_rent_rebate.d.ts.map