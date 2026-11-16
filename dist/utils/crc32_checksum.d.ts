/**
 * AgentSentinel - CRC32 Calculator Utility
 * Implements IEEE 802.3 32-bit Cyclic Redundancy Check for payload framing integrity.
 */
export declare class Crc32Calculator {
    private static table;
    static calculate(data: string | Uint8Array): number;
    static calculateHex(data: string | Uint8Array): string;
    static verify(data: string | Uint8Array, expected: number | string): boolean;
}
//# sourceMappingURL=crc32_checksum.d.ts.map