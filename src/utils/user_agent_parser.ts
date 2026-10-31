/**
 * AgentSentinel - User Agent Parser Utility
 * Inspects HTTP User-Agent strings to identify tools and detect hostile automated scanners.
 */

export interface UserAgentInfo {
  raw: string;
  isBot: boolean;
  isScanner: boolean;
}

export class UserAgentParser {
  private static readonly SCANNER_PATTERNS = [
    /nikto/i,
    /sqlmap/i,
    /nmap/i,
    /masscan/i,
    /burpcollaborator/i,
    /dirbuster/i
  ];

  private static readonly BOT_PATTERNS = [
    /curl/i,
    /wget/i,
    /python-requests/i,
    /postman/i,
    /axios/i,
    /go-http-client/i
  ];

  public static parse(userAgent: string): UserAgentInfo {
    if (!userAgent || typeof userAgent !== 'string') {
      return { raw: '', isBot: false, isScanner: false };
    }

    const clean = userAgent.trim();
    const isScanner = this.SCANNER_PATTERNS.some(p => p.test(clean));
    const isBot = isScanner || this.BOT_PATTERNS.some(p => p.test(clean));

    return {
      raw: clean,
      isBot,
      isScanner
    };
  }
}
