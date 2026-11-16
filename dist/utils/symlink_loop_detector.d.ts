/**
 * SymlinkLoopDetector - Cycle detector for recursive directory traversals.
 */
export declare class SymlinkLoopDetector {
    private visitedPaths;
    registerPath(resolvedRealPath: string): boolean;
    hasCycle(resolvedRealPath: string): boolean;
    getVisitedCount(): number;
    reset(): void;
}
//# sourceMappingURL=symlink_loop_detector.d.ts.map