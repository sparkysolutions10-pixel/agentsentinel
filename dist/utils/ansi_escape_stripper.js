/**
 * AgentSentinel - ANSI Escape Sequence Stripper Utility
 * Removes terminal color codes and escape sequences from tool outputs and audit logs.
 */
export class AnsiEscapeStripper {
    static ANSI_REGEX = /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g;
    static strip(text) {
        if (!text || typeof text !== 'string')
            return '';
        return text.replace(this.ANSI_REGEX, '');
    }
    static hasAnsi(text) {
        if (!text || typeof text !== 'string')
            return false;
        return this.ANSI_REGEX.test(text);
    }
}
//# sourceMappingURL=ansi_escape_stripper.js.map