/**
 * AgentSentinel - Content Type Guard Utility
 * Validates Content-Type header strings and ensures strict application/json adherence.
 */

export class ContentTypeGuard {
  public static getBaseMimeType(contentType: string): string {
    if (!contentType || typeof contentType !== 'string') return '';
    return contentType.split(';')[0].trim().toLowerCase();
  }

  public static isJsonContentType(contentType: string): boolean {
    const base = this.getBaseMimeType(contentType);
    return base === 'application/json' || base === 'application/vnd.api+json' || base.endsWith('+json');
  }
}
