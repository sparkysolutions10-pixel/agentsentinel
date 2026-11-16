export class KeyMemoryZeroizer {
    static zeroize(buffer) {
        if (Buffer.isBuffer(buffer)) {
            buffer.fill(0);
        }
    }
    static zeroizeArray(buffers) {
        for (const b of buffers) {
            KeyMemoryZeroizer.zeroize(b);
        }
    }
}
//# sourceMappingURL=zeroizer.js.map