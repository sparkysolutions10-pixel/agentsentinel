export class Base32Encoder {
  private static readonly ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  public static encode(buffer: Buffer): string {
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      while (bits >= 5) {
        output += this.ALPHABET[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += this.ALPHABET[(value << (5 - bits)) & 31];
    }

    while (output.length % 8 !== 0) {
      output += '=';
    }

    return output;
  }

  public static decode(input: string): Buffer {
    const clean = input.replace(/=+$/, '').toUpperCase();
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];

    for (let i = 0; i < clean.length; i++) {
      const idx = this.ALPHABET.indexOf(clean[i]);
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(bytes);
  }
}
