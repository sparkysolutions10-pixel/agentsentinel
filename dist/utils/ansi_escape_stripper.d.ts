/**
 * AgentSentinel - ANSI Escape Sequence Stripper Utility
 * Removes terminal color codes and escape sequences from tool outputs and audit logs.
 */
export declare class AnsiEscapeStripper {
    private static readonly ANSI_REGEX;
    static strip(text: string): string;
    static hasAnsi(text: string): boolean;
}
//# sourceMappingURL=ansi_escape_stripper.d.ts.map