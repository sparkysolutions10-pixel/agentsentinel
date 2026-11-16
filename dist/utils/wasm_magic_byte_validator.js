export class WasmMagicByteValidator {
    static isWasmBinary(buffer) {
        if (!buffer || buffer.length < 4)
            return false;
        return buffer[0] === 0x00 && buffer[1] === 0x61 && buffer[2] === 0x73 && buffer[3] === 0x6d;
    }
}
//# sourceMappingURL=wasm_magic_byte_validator.js.map