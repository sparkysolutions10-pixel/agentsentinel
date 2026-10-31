import path from 'path';

/**
 * SymlinkLoopDetector - Cycle detector for recursive directory traversals.
 */

export class SymlinkLoopDetector {
  private visitedPaths: Set<string> = new Set();

  public registerPath(resolvedRealPath: string): boolean {
    if (!resolvedRealPath || typeof resolvedRealPath !== 'string') return false;
    const normalized = path.resolve(resolvedRealPath).toLowerCase();
    if (this.visitedPaths.has(normalized)) {
      return false; // Loop detected
    }
    this.visitedPaths.add(normalized);
    return true; // Safe to visit
  }

  public hasCycle(resolvedRealPath: string): boolean {
    const normalized = path.resolve(resolvedRealPath).toLowerCase();
    return this.visitedPaths.has(normalized);
  }

  public getVisitedCount(): number {
    return this.visitedPaths.size;
  }

  public reset(): void {
    this.visitedPaths.clear();
  }
}
