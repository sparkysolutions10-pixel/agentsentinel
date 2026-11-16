import path from 'path';
export class SymlinkTargetInspector {
    static isTargetInsideRoot(linkDir, targetPath, rootDir) {
        const resolvedRoot = path.resolve(rootDir);
        const resolvedTarget = path.resolve(linkDir, targetPath);
        return resolvedTarget.startsWith(resolvedRoot);
    }
}
//# sourceMappingURL=symlink_target_inspector.js.map