export class SorobanFeeBudgetGuard {
    static isWithinBudget(instructions, feeStroops, maxInstructions, maxFeeStroops) {
        return instructions <= maxInstructions && feeStroops <= maxFeeStroops;
    }
}
//# sourceMappingURL=soroban_fee_budget_guard.js.map