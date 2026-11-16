/**
 * AgentSentinel - Base64 Instruction Sniffer Utility
 * Sniffs out Base64 encoded payload segments and flags hidden destructive shell instructions.
 */
export declare class Base64InstructionSniffer {
    private static readonly B64_CHUNK_REGEX;
    private static readonly DANGEROUS_TOKENS;
    static extractDecodedSuspiciousStrings(text: string): string[];
}
//# sourceMappingURL=base64_instruction_sniffer.d.ts.map