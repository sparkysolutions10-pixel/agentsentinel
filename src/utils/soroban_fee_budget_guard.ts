export class SorobanFeeBudgetGuard {
  public static isWithinBudget(instructions: number, feeStroops: number, maxInstructions: number, maxFeeStroops: number): boolean {
    return instructions <= maxInstructions && feeStroops <= maxFeeStroops;
  }
}
