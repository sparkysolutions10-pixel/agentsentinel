export class KeyMemoryZeroizer {
  public static zeroize(buffer: Buffer): void {
    if (Buffer.isBuffer(buffer)) {
      buffer.fill(0);
    }
  }

  public static zeroizeArray(buffers: Buffer[]): void {
    for (const b of buffers) {
      KeyMemoryZeroizer.zeroize(b);
    }
  }
}
