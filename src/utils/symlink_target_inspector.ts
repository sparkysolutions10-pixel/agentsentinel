import path from 'path';

export class SymlinkTargetInspector {
  public static isTargetInsideRoot(linkDir: string, targetPath: string, rootDir: string): boolean {
    const resolvedRoot = path.resolve(rootDir);
    const resolvedTarget = path.resolve(linkDir, targetPath);
    return resolvedTarget.startsWith(resolvedRoot);
  }
}
