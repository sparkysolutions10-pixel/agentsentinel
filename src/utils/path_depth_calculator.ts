import path from 'path';

/**
 * PathDepthCalculator - Path segment depth calculator and nesting ceiling enforcer.
 */

export class PathDepthCalculator {
  public static calculateDepth(filePath: string): number {
    if (!filePath || typeof filePath !== 'string') return 0;
    const normalized = path.normalize(filePath).replace(/^(\/|\\)+/, '');
    const segments = normalized.split(/[\/\\]+/).filter(s => s.length > 0 && s !== '.');
    return segments.length;
  }

  public static isWithinMaxDepth(filePath: string, maxDepth: number): boolean {
    if (maxDepth < 0) return false;
    return this.calculateDepth(filePath) <= maxDepth;
  }
}
