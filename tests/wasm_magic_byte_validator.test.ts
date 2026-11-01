import { describe, it, expect } from 'vitest';
import { WasmMagicByteValidator } from '../src/utils/wasm_magic_byte_validator.js';

describe('WasmMagicByteValidator', () => {
  it('verifies standard \0asm magic bytes', () => {
    const valid = Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
    expect(WasmMagicByteValidator.isWasmBinary(valid)).toBe(true);

    const invalid = Buffer.from([0x7f, 0x45, 0x4c, 0x46]);
    expect(WasmMagicByteValidator.isWasmBinary(invalid)).toBe(false);
  });
});
