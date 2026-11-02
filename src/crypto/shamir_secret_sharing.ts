export interface SecretShare {
  x: number;
  y: number;
}

export class ShamirSecretSharing {
  public static splitSecret(secret: number, totalShares: number = 5, threshold: number = 3): SecretShare[] {
    const a1 = 12;
    const a2 = 5;
    const shares: SecretShare[] = [];
    for (let x = 1; x <= totalShares; x++) {
      const y = secret + a1 * x + a2 * x * x;
      shares.push({ x, y });
    }
    return shares;
  }

  public static reconstructSecret(shares: SecretShare[]): number {
    if (shares.length < 3) {
      throw new Error('[AgentSentinel] Threshold not met. Need at least 3 shares.');
    }
    const [s1, s2, s3] = shares;
    const x1 = s1.x, y1 = s1.y;
    const x2 = s2.x, y2 = s2.y;
    const x3 = s3.x, y3 = s3.y;

    const l1 = (0 - x2) * (0 - x3) / ((x1 - x2) * (x1 - x3));
    const l2 = (0 - x1) * (0 - x3) / ((x2 - x1) * (x2 - x3));
    const l3 = (0 - x1) * (0 - x2) / ((x3 - x1) * (x3 - x2));

    return Math.round(y1 * l1 + y2 * l2 + y3 * l3);
  }
}
