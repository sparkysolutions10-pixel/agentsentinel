export class SorobanTtlExtensionGuard {
  public static needsExtension(currentLedger: number, liveUntilLedger: number, thresholdLedgers: number): boolean {
    const remaining = liveUntilLedger - currentLedger;
    return remaining <= thresholdLedgers;
  }
}
