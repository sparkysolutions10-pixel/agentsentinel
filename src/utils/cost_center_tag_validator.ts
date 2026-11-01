export class CostCenterTagValidator {
  public static validate(tags: Record<string, string>, requiredKeys: string[]): { isValid: boolean; missingKeys: string[] } {
    if (!tags || typeof tags !== 'object') {
      return { isValid: false, missingKeys: [...requiredKeys] };
    }
    const missingKeys = requiredKeys.filter(k => !tags[k] || tags[k].trim() === '');
    return {
      isValid: missingKeys.length === 0,
      missingKeys
    };
  }
}
