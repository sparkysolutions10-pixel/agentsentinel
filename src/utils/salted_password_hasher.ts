/**
 * AgentSentinel - Salted Password Hasher Utility
 * Implements PBKDF2-SHA512 password hashing with cryptographically secure random salts.
 */

import crypto from 'node:crypto';
import { ConstantTimeEquality } from './constant_time_equality.js';

export interface HashOptions {
  saltLength?: number;
  iterations?: number;
  keyLength?: number;
}

export class SaltedPasswordHasher {
  private static readonly DEFAULT_ITERATIONS = 10000;
  private static readonly DEFAULT_SALT_LEN = 16;
  private static readonly DEFAULT_KEY_LEN = 32;

  public static hash(password: string, options: HashOptions = {}): string {
    const iter = options.iterations ?? this.DEFAULT_ITERATIONS;
    const saltLen = options.saltLength ?? this.DEFAULT_SALT_LEN;
    const keyLen = options.keyLength ?? this.DEFAULT_KEY_LEN;

    const salt = crypto.randomBytes(saltLen).toString('hex');
    const derived = crypto.pbkdf2Sync(password, salt, iter, keyLen, 'sha512').toString('hex');

    return `$pbkdf2$${iter}$${salt}$${derived}`;
  }

  public static verify(password: string, serializedHash: string): boolean {
    const parts = serializedHash.split('$');
    if (parts.length !== 5 || parts[1] !== 'pbkdf2') {
      return false;
    }

    const iter = parseInt(parts[2], 10);
    const salt = parts[3];
    const expectedHash = parts[4];
    const keyLen = expectedHash.length / 2;

    const actualHash = crypto.pbkdf2Sync(password, salt, iter, keyLen, 'sha512').toString('hex');
    return ConstantTimeEquality.areEqual(actualHash, expectedHash);
  }
}
