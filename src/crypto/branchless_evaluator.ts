export class BranchlessEvaluator {
  /**
   * Branchless equality check between two numbers (0 or 1 result).
   * Uses bitwise XOR and shift operations without conditional branches.
   */
  public static equals32(a: number, b: number): number {
    const diff = (a ^ b) >>> 0;
    return (1 ^ ((diff | -diff) >>> 31)) >>> 0;
  }

  /**
   * Branchless conditional select: returns x when condition is 1, y when condition is 0.
   */
  public static select32(condition: number, x: number, y: number): number {
    const mask = -condition; // 0 -> 0x00000000, 1 -> 0xFFFFFFFF
    return ((x & mask) | (y & ~mask)) >>> 0;
  }

  /**
   * Branchless constant-time buffer equivalence using cumulative bitwise OR.
   */
  public static constantTimeCompare(a: Uint8Array, b: Uint8Array): number {
    if (a.length !== b.length) return 0;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
      mismatch |= (a[i] ^ b[i]);
    }
    return (1 ^ ((mismatch | -mismatch) >>> 31)) >>> 0;
  }
}
