export interface NoiseState {
  currentNoiseBudgetBits: number;
  initialNoiseBudgetBits: number;
  bootstrapsPerformed: number;
}

export class FheNoiseManager {
  private state: NoiseState;

  constructor(initialBudgetBits: number = 120) {
    this.state = {
      currentNoiseBudgetBits: initialBudgetBits,
      initialNoiseBudgetBits: initialBudgetBits,
      bootstrapsPerformed: 0
    };
  }

  public consumeNoise(operationBits: number = 15): void {
    this.state.currentNoiseBudgetBits -= operationBits;
    if (this.state.currentNoiseBudgetBits <= 20) {
      this.bootstrap();
    }
  }

  public bootstrap(): void {
    // Refresh ciphertext noise budget back to near initial capacity
    this.state.currentNoiseBudgetBits = this.state.initialNoiseBudgetBits - 5;
    this.state.bootstrapsPerformed++;
  }

  public getState(): NoiseState {
    return { ...this.state };
  }
}
