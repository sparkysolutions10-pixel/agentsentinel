/**
 * AgentSentinel - HMAC Signature Validator Utility
 * Signs and verifies payload authenticity with constant-time protection.
 */

import crypto from 'node:crypto';
import { ConstantTimeEquality } from './constant_time_equality.js';

export class HmacSignatureValidator {
  public static sign(payload: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(payload, 'utf-8').digest('hex');
  }

  public static verify(
    payload: string,
    signature: string,
    secret: string,
    algorithm: string = 'sha256'
  ): boolean {
    const expected = this.sign(payload, secret, algorithm);
    const cleanSig = signature.trim().toLowerCase();
    const cleanExpected = expected.toLowerCase();
    return ConstantTimeEquality.areEqual(cleanSig, cleanExpected);
  }
}
