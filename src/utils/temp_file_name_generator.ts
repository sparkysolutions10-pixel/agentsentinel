import crypto from 'crypto';
import path from 'path';
import os from 'os';

/**
 * TempFileNameGenerator - Collision-resistant secure temporary file name generator.
 */

export interface TempFileOptions {
  prefix?: string;
  extension?: string;
  dir?: string;
}

export class TempFileNameGenerator {
  public static generate(options?: TempFileOptions): string {
    const prefix = options?.prefix ?? 'sentinel_';
    const ext = options?.extension ? (options.extension.startsWith('.') ? options.extension : `.${options.extension}`) : '.tmp';
    const baseDir = options?.dir ?? os.tmpdir();

    const timestamp = Date.now();
    const entropy = crypto.randomBytes(8).toString('hex');
    const fileName = `${prefix}${timestamp}_${entropy}${ext}`;

    return path.join(baseDir, fileName);
  }
}
