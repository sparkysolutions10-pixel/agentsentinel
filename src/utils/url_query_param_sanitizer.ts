/**
 * AgentSentinel - URL Query Parameter Sanitizer Utility
 * Strips sensitive API keys, tokens, and credentials from URLs before audit logging.
 */

export class UrlQueryParamSanitizer {
  private static readonly SENSITIVE_KEY_REGEX =
    /^(api_?key|token|auth|secret|password|access_token|bearer|signature|sig)$/i;

  public static sanitize(urlStr: string, redactor: string = '[REDACTED]'): string {
    if (!urlStr || typeof urlStr !== 'string') return '';
    try {
      const url = new URL(urlStr);
      for (const key of Array.from(url.searchParams.keys())) {
        if (this.SENSITIVE_KEY_REGEX.test(key)) {
          url.searchParams.set(key, redactor);
        }
      }
      return url.toString();
    } catch {
      // In case of invalid URL, return original
      return urlStr;
    }
  }
}
