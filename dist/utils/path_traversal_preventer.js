import path from 'path';
export class PathTraversalPreventer {
    static isSafePath(baseDir, userPath) {
        if (!baseDir || !userPath)
            return false;
        const resolvedBase = path.resolve(baseDir);
        const resolvedTarget = path.resolve(baseDir, userPath);
        return resolvedTarget.startsWith(resolvedBase);
    }
}
//# sourceMappingURL=path_traversal_preventer.js.map