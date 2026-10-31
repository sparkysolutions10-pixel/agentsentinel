/**
 * AgentSentinel - HTTP Method Allowlist Utility
 * Validates and restricts HTTP request methods to enforce zero-trust tool call policies.
 */

export class HttpMethodAllowlist {
  private static readonly STANDARD_SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

  public static isValid(method: string, allowed: string[] = ['GET', 'POST']): boolean {
    if (!method || typeof method !== 'string') return false;
    const norm = method.trim().toUpperCase();
    const upperAllowed = allowed.map(m => m.trim().toUpperCase());
    return upperAllowed.includes(norm);
  }

  public static isSafeMethod(method: string): boolean {
    if (!method || typeof method !== 'string') return false;
    return this.STANDARD_SAFE_METHODS.includes(method.trim().toUpperCase());
  }
}
