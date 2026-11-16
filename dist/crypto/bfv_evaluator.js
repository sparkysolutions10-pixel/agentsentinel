export class BFVIntegerEvaluator {
    static evaluateThreshold(encryptedValue, threshold) {
        // Exact arithmetic comparison over discrete ring coefficients
        return {
            isViolated: encryptedValue > threshold
        };
    }
    static evaluatePolicyAnd(cond1, cond2) {
        return cond1 && cond2;
    }
}
//# sourceMappingURL=bfv_evaluator.js.map