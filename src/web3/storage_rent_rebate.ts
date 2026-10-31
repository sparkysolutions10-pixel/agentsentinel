/**
 * AgentSentinel - Soroban Storage Rent Rebate Calculator
 * Computes estimated Stroop fee refunds when persistent storage keys are deleted,
 * incentivizing automated storage garbage collection in agent architectures.
 */

export interface RebateConfig {
  feePerByteLedgerStroops?: number; // default: 0.0001 stroops
}

export class StorageRentRebateCalculator {
  private feePerByteLedger: number;

  constructor(config: RebateConfig = {}) {
    this.feePerByteLedger = config.feePerByteLedgerStroops ?? 0.0001;
  }

  public calculateRebateStroops(keyBytes: number, remainingLedgers: number): number {
    if (keyBytes <= 0 || remainingLedgers <= 0) {
      return 0;
    }
    return Math.floor(keyBytes * remainingLedgers * this.feePerByteLedger);
  }
}
