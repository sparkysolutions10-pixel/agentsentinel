export class ConfigurationMerger {
  public static merge<T extends Record<string, any>>(defaults: T, overrides: Partial<T>): T {
    const result: any = { ...defaults };
    if (!overrides || typeof overrides !== 'object') return result;

    for (const key of Object.keys(overrides)) {
      const val = overrides[key];
      if (val && typeof val === 'object' && !Array.isArray(val) && result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
        result[key] = this.merge(result[key], val);
      } else if (val !== undefined) {
        result[key] = val;
      }
    }

    return result as T;
  }
}
