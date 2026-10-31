/**
 * AgentSentinel - Markdown Escape Sanitizer Utility
 * Escapes Markdown formatting characters to prevent injection of malicious links or headings.
 */

export class MarkdownEscapeSanitizer {
  private static readonly ESCAPE_REGEX = /([\\`*_[\]()#+\-.!~|<>{}])/g;
  private static readonly UNESCAPE_REGEX = /\\([\\`*_[\]()#+\-.!~|<>{}])/g;

  public static escape(text: string): string {
    if (!text || typeof text !== 'string') return '';
    return text.replace(this.ESCAPE_REGEX, '\\$1');
  }

  public static unescape(text: string): string {
    if (!text || typeof text !== 'string') return '';
    return text.replace(this.UNESCAPE_REGEX, '$1');
  }
}
