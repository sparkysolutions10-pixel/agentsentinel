/**
 * AgentSentinel - X.509 Certificate Fingerprint Extractor Utility
 * Calculates and matches SHA-256 certificate fingerprints for TLS pinning.
 */

import crypto from 'node:crypto';
import { ConstantTimeEquality } from './constant_time_equality.js';

export class X509FingerprintExtractor {
  public static extractSha256(certData: string | Uint8Array, formatted: boolean = true): string {
    let buf: Buffer;
    if (typeof certData === 'string') {
      const cleanPem = certData
        .replace(/-----BEGIN CERTIFICATE-----/g, '')
        .replace(/-----END CERTIFICATE-----/g, '')
        .replace(/\s+/g, '');
      buf = Buffer.from(cleanPem, 'base64');
    } else {
      buf = Buffer.from(certData);
    }

    const hex = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
    if (!formatted) return hex;

    const parts: string[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      parts.push(hex.substring(i, i + 2));
    }
    return parts.join(':');
  }

  public static matches(certData: string | Uint8Array, pinnedFingerprint: string): boolean {
    const rawActual = this.extractSha256(certData, false);
    const rawPinned = pinnedFingerprint.replace(/[:\s-]/g, '').toUpperCase();
    return ConstantTimeEquality.areEqual(rawActual, rawPinned);
  }
}
