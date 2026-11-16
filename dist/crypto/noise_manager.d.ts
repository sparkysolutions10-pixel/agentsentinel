export interface NoiseState {
    currentNoiseBudgetBits: number;
    initialNoiseBudgetBits: number;
    bootstrapsPerformed: number;
}
export declare class FheNoiseManager {
    private state;
    constructor(initialBudgetBits?: number);
    consumeNoise(operationBits?: number): void;
    bootstrap(): void;
    getState(): NoiseState;
}
//# sourceMappingURL=noise_manager.d.ts.map