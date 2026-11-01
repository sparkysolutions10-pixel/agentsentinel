export class SorobanLedgerSequenceGuard {
  public static isWithinBounds(currentLedger: number, minLedger?: number, maxLedger?: number): boolean {
    if (minLedger !== undefined && currentLedger < minLedger) return false;
    if (maxLedger !== undefined && currentLedger > maxLedger) return false;
    return true;
  }
}
