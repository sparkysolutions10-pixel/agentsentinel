/**
 * AgentSentinel - CORS Origin Validator Utility
 * Evaluates Origin headers against exact domain patterns and wildcard subdomains securely.
 */

export class CorsOriginValidator {
  public static isOriginAllowed(origin: string, allowedPatterns: string[]): boolean {
    if (!origin || typeof origin !== 'string') return false;
    const cleanOrigin = origin.trim().toLowerCase();

    if (cleanOrigin === 'null') return false; // Prevent null-origin bypasses

    for (const pattern of allowedPatterns) {
      const cleanPattern = pattern.trim().toLowerCase();
      if (cleanPattern === '*') return true;
      if (cleanPattern === cleanOrigin) return true;

      // Handle wildcard subdomain e.g. https://*.example.com
      if (cleanPattern.includes('*.')) {
        const regexStr = '^' + cleanPattern.replace(/\./g, '\\.').replace(/\*/g, '[a-z0-9-]+') + '$';
        const regex = new RegExp(regexStr);
        if (regex.test(cleanOrigin)) {
          return true;
        }
      }
    }

    return false;
  }
}
