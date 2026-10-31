/**
 * AgentSentinel - Allowed Keys Validator Utility
 * Validates that object dictionaries do not contain forbidden or unexpected extra keys.
 */

export class AllowedKeysValidator {
  public static getUnexpectedKeys(obj: unknown, allowedKeys: string[]): string[] {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
    const keys = Object.keys(obj as Record<string, unknown>);
    const allowedSet = new Set(allowedKeys);
    return keys.filter(k => !allowedSet.has(k));
  }

  public static hasOnlyAllowedKeys(obj: unknown, allowedKeys: string[]): boolean {
    return this.getUnexpectedKeys(obj, allowedKeys).length === 0;
  }
}
