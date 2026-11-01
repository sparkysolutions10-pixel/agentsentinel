export class SafeFileReader {
  public static isSafeSize(sizeBytes: number, maxBytes: number = 10 * 1024 * 1024): boolean {
    return sizeBytes >= 0 && sizeBytes <= maxBytes;
  }
}
