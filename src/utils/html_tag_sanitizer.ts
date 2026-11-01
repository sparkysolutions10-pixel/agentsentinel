/**
 * Strips or escapes HTML tags and entities from agent outputs to prevent XSS.
 */
export class HtmlTagSanitizer {
  private static readonly ENTITY_MAP: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  public static escape(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input.replace(/[&<>"']/g, char => this.ENTITY_MAP[char] || char);
  }

  public static stripTags(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input.replace(/<[^>]*>/g, '');
  }

  public static stripScriptAndStyle(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  }
}
