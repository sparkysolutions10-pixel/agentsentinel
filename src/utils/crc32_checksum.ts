/**
 * AgentSentinel - CRC32 Calculator Utility
 * Implements IEEE 802.3 32-bit Cyclic Redundancy Check for payload framing integrity.
 */

export class Crc32Calculator {
  private static table: Uint32Array = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      t[i] = c >>> 0;
    }
    return t;
  })();

  public static calculate(data: string | Uint8Array): number {
    const bytes = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ this.table[(crc ^ bytes[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  public static calculateHex(data: string | Uint8Array): string {
    const crc = this.calculate(data);
    return crc.toString(16).padStart(8, '0').toLowerCase();
  }

  public static verify(data: string | Uint8Array, expected: number | string): boolean {
    if (typeof expected === 'string') {
      return this.calculateHex(data) === expected.toLowerCase().trim();
    }
    return this.calculate(data) === expected;
  }
}
