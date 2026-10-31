import path from 'path';

/**
 * ZipSlipDetector - Validates extraction paths against directory escape attacks.
 */

export class ZipSlipDetector {
  public static isSafeExtractionPath(destinationDir: string, entryPath: string): boolean {
    if (!destinationDir || !entryPath) return false;

    const resolvedDest = path.resolve(destinationDir);
    const resolvedTarget = path.resolve(destinationDir, entryPath);

    return resolvedTarget.startsWith(resolvedDest + path.sep) || resolvedTarget === resolvedDest;
  }

  public static sanitizeEntryPath(entryPath: string): string {
    return entryPath.replace(/(\.\.[\/\\]+)+/g, '').replace(/^[\/\\]+/, '');
  }
}
