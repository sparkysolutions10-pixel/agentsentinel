/**
 * OperationTypeClassifier - Stellar operation classification and risk assessment.
 */
export type OperationRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface ClassifiedOperation {
    type: string;
    category: 'payment' | 'account' | 'trustline' | 'dex' | 'liquidity_pool' | 'soroban' | 'governance';
    riskLevel: OperationRiskLevel;
    description: string;
}
export declare class OperationTypeClassifier {
    private static readonly CLASSIFICATIONS;
    static classify(operationType: string): ClassifiedOperation;
    static isHighRisk(operationType: string): boolean;
}
//# sourceMappingURL=operation_type_classifier.d.ts.map