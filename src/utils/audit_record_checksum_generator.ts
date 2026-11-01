import crypto from 'crypto';

export class AuditRecordChecksumGenerator {
  public static generate(previousHash: string, record: any): string {
    const payload = `${previousHash}|${JSON.stringify(record)}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }
}
