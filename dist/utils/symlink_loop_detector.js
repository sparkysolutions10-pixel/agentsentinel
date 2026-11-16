import path from 'path';
/**
 * SymlinkLoopDetector - Cycle detector for recursive directory traversals.
 */
export class SymlinkLoopDetector {
    visitedPaths = new Set();
    registerPath(resolvedRealPath) {
        if (!resolvedRealPath || typeof resolvedRealPath !== 'string')
            return false;
        const normalized = path.resolve(resolvedRealPath).toLowerCase();
        if (this.visitedPaths.has(normalized)) {
            return false; // Loop detected
        }
        this.visitedPaths.add(normalized);
        return true; // Safe to visit
    }
    hasCycle(resolvedRealPath) {
        const normalized = path.resolve(resolvedRealPath).toLowerCase();
        return this.visitedPaths.has(normalized);
    }
    getVisitedCount() {
        return this.visitedPaths.size;
    }
    reset() {
        this.visitedPaths.clear();
    }
}
//# sourceMappingURL=symlink_loop_detector.js.map