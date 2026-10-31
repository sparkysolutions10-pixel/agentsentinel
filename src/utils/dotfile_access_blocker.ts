import path from 'path';

/**
 * DotfileAccessBlocker - Shield against access to hidden files and secret directories.
 */

export class DotfileAccessBlocker {
  private static readonly CRITICAL_DOTFILES = new Set([
    '.git',
    '.env',
    '.ssh',
    '.aws',
    '.npmrc',
    '.bashrc',
    '.zshrc',
    '.netrc'
  ]);

  public static isDotfileOrDirectory(filePath: string): boolean {
    if (!filePath || typeof filePath !== 'string') return false;
    const normalized = path.normalize(filePath);
    const segments = normalized.split(/[\/\\]+/);

    return segments.some(segment => segment.startsWith('.') && segment !== '.' && segment !== '..');
  }

  public static isCriticalSecretFile(filePath: string): boolean {
    if (!filePath || typeof filePath !== 'string') return false;
    const normalized = path.normalize(filePath).toLowerCase();
    const segments = normalized.split(/[\/\\]+/);

    return segments.some(segment => {
      if (this.CRITICAL_DOTFILES.has(segment)) return true;
      if (segment.startsWith('.env.')) return true;
      return false;
    });
  }
}
