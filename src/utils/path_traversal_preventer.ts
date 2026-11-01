import path from 'path';

export class PathTraversalPreventer {
  public static isSafePath(baseDir: string, userPath: string): boolean {
    if (!baseDir || !userPath) return false;
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(baseDir, userPath);
    return resolvedTarget.startsWith(resolvedBase);
  }
}
