/**
 * DotfileAccessBlocker - Shield against access to hidden files and secret directories.
 */
export declare class DotfileAccessBlocker {
    private static readonly CRITICAL_DOTFILES;
    static isDotfileOrDirectory(filePath: string): boolean;
    static isCriticalSecretFile(filePath: string): boolean;
}
//# sourceMappingURL=dotfile_access_blocker.d.ts.map