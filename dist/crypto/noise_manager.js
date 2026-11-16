export class FheNoiseManager {
    state;
    constructor(initialBudgetBits = 120) {
        this.state = {
            currentNoiseBudgetBits: initialBudgetBits,
            initialNoiseBudgetBits: initialBudgetBits,
            bootstrapsPerformed: 0
        };
    }
    consumeNoise(operationBits = 15) {
        this.state.currentNoiseBudgetBits -= operationBits;
        if (this.state.currentNoiseBudgetBits <= 20) {
            this.bootstrap();
        }
    }
    bootstrap() {
        // Refresh ciphertext noise budget back to near initial capacity
        this.state.currentNoiseBudgetBits = this.state.initialNoiseBudgetBits - 5;
        this.state.bootstrapsPerformed++;
    }
    getState() {
        return { ...this.state };
    }
}
//# sourceMappingURL=noise_manager.js.map