import crypto from 'crypto';

export class EncryptedVectorQueryWrapper {
  public static encryptQueryVector(vector: number[], secretKey: Buffer): { encryptedPayload: string; iv: string } {
    const iv = crypto.randomBytes(12);
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const serialized = JSON.stringify(vector);
    const encrypted = Buffer.concat([cipher.update(serialized, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      encryptedPayload: Buffer.concat([tag, encrypted]).toString('base64'),
      iv: iv.toString('hex')
    };
  }

  public static decryptQueryVector(encryptedPayload: string, ivHex: string, secretKey: Buffer): number[] {
    const raw = Buffer.from(encryptedPayload, 'base64');
    const tag = raw.subarray(0, 16);
    const ciphertext = raw.subarray(16);
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  }
}
