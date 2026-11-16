import path from 'path';
/**
 * DotfileAccessBlocker - Shield against access to hidden files and secret directories.
 */
export class DotfileAccessBlocker {
    static CRITICAL_DOTFILES = new Set([
        '.git',
        '.env',
        '.ssh',
        '.aws',
        '.npmrc',
        '.bashrc',
        '.zshrc',
        '.netrc'
    ]);
    static isDotfileOrDirectory(filePath) {
        if (!filePath || typeof filePath !== 'string')
            return false;
        const normalized = path.normalize(filePath);
        const segments = normalized.split(/[\/\\]+/);
        return segments.some(segment => segment.startsWith('.') && segment !== '.' && segment !== '..');
    }
    static isCriticalSecretFile(filePath) {
        if (!filePath || typeof filePath !== 'string')
            return false;
        const normalized = path.normalize(filePath).toLowerCase();
        const segments = normalized.split(/[\/\\]+/);
        return segments.some(segment => {
            if (this.CRITICAL_DOTFILES.has(segment))
                return true;
            if (segment.startsWith('.env.'))
                return true;
            return false;
        });
    }
}
//# sourceMappingURL=dotfile_access_blocker.js.map