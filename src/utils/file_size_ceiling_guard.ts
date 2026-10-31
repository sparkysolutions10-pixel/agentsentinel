/**
 * FileSizeCeilingGuard - Ingestion size limit guard for memory exhaustion defense.
 */

export class FileSizeCeilingGuard {
  public static readonly DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

  public static isWithinCeiling(sizeBytes: number, maxBytes: number = this.DEFAULT_MAX_BYTES): boolean {
    if (typeof sizeBytes !== 'number' || sizeBytes < 0 || isNaN(sizeBytes)) {
      return false;
    }
    return sizeBytes <= maxBytes;
  }

  public static assertWithinCeiling(sizeBytes: number, maxBytes: number = this.DEFAULT_MAX_BYTES): void {
    if (!this.isWithinCeiling(sizeBytes, maxBytes)) {
      throw new Error(`File size ${sizeBytes} bytes exceeds maximum allowed ceiling of ${maxBytes} bytes`);
    }
  }
}
