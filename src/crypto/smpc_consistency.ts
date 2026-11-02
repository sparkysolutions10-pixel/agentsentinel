import crypto from 'crypto';

export interface SmpcShare {
  participantId: string;
  shareIndex: number;
  value: number;
  commitmentHash: string;
}

export class SmpcConsistencyChecker {
  public static verifyShare(share: SmpcShare, salt: string): boolean {
    const expectedHash = crypto.createHash('sha256').update(`${share.value}:${salt}`).digest('hex');
    return share.commitmentHash === expectedHash;
  }

  public static isolateMaliciousParties(shares: SmpcShare[], salt: string): { validShares: SmpcShare[]; evictedParties: string[] } {
    const validShares: SmpcShare[] = [];
    const evictedParties: string[] = [];

    for (const s of shares) {
      if (SmpcConsistencyChecker.verifyShare(s, salt)) {
        validShares.push(s);
      } else {
        evictedParties.push(s.participantId);
      }
    }

    return { validShares, evictedParties };
  }
}
