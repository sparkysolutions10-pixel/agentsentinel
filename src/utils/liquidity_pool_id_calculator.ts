import crypto from 'crypto';

/**
 * LiquidityPoolIdCalculator - Stellar liquidity pool constant-product ID calculator.
 */

export class LiquidityPoolIdCalculator {
  public static sortAssets(assetA: string, assetB: string): [string, string] {
    if (assetA === 'XLM' || assetA === 'native') return [assetA, assetB];
    if (assetB === 'XLM' || assetB === 'native') return [assetB, assetA];
    return assetA < assetB ? [assetA, assetB] : [assetB, assetA];
  }

  public static calculatePoolId(assetA: string, assetB: string, feeBps: number = 30): string {
    if (feeBps < 0 || feeBps > 10000) {
      throw new Error('Fee basis points must be between 0 and 10,000');
    }
    const [sortedA, sortedB] = this.sortAssets(assetA, assetB);
    const serialized = `pool:constant_product:${sortedA}:${sortedB}:${feeBps}`;
    return crypto.createHash('sha256').update(serialized, 'utf-8').digest('hex');
  }
}
