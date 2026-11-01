/**
 * Safe JSON property extractor using dot and array bracket notation without eval.
 */
export class JsonPathExtractor {
  public static get<T = any>(obj: any, path: string, defaultValue?: T): T {
    if (!obj || typeof obj !== 'object' || !path || typeof path !== 'string') {
      return defaultValue as T;
    }

    const segments = path
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .filter(Boolean);

    let current = obj;
    for (const segment of segments) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue as T;
      }
      current = current[segment];
    }

    return current === undefined ? (defaultValue as T) : (current as T);
  }

  public static has(obj: any, path: string): boolean {
    const sentinel = Symbol('NOT_FOUND');
    return this.get(obj, path, sentinel) !== sentinel;
  }
}
