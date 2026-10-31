/**
 * AgentSentinel - ANSI Escape Sequence Stripper Utility
 * Removes terminal color codes and escape sequences from tool outputs and audit logs.
 */

export class AnsiEscapeStripper {
  private static readonly ANSI_REGEX =
    /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g;

  public static strip(text: string): string {
    if (!text || typeof text !== 'string') return '';
    return text.replace(this.ANSI_REGEX, '');
  }

  public static hasAnsi(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    return this.ANSI_REGEX.test(text);
  }
}
