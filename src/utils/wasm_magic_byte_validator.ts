export class WasmMagicByteValidator {
  public static isWasmBinary(buffer: Buffer | Uint8Array): boolean {
    if (!buffer || buffer.length < 4) return false;
    return buffer[0] === 0x00 && buffer[1] === 0x61 && buffer[2] === 0x73 && buffer[3] === 0x6d;
  }
}
