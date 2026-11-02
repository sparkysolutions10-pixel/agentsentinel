import crypto from 'crypto';

export class ModelWeightCommitment {
  public static computeCommitment(weightsBuffer: Buffer): string {
    return crypto.createHash('sha384').update(weightsBuffer).digest('hex');
  }

  public static verifyCommitment(weightsBuffer: Buffer, expectedCommitment: string): boolean {
    return ModelWeightCommitment.computeCommitment(weightsBuffer) === expectedCommitment;
  }
}
