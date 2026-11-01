import crypto from 'crypto';

export class SorobanEventSignatureHasher {
  public static hashTopic(topic: string): string {
    return crypto.createHash('sha256').update(topic).digest('hex');
  }
}
