import { describe, it, expect } from 'vitest';
import { SymlinkLoopDetector } from '../src/utils/symlink_loop_detector.js';

describe('SymlinkLoopDetector', () => {
  it('allows unique paths and rejects re-visiting cyclical symlinks', () => {
    const detector = new SymlinkLoopDetector();

    expect(detector.registerPath('/app/data')).toBe(true);
    expect(detector.registerPath('/app/data/sub')).toBe(true);
    // Cycle back to /app/data
    expect(detector.registerPath('/app/data')).toBe(false);
    expect(detector.hasCycle('/app/data')).toBe(true);
  });

  it('resets tracking history cleanly', () => {
    const detector = new SymlinkLoopDetector();
    detector.registerPath('/var/log');
    detector.reset();
    expect(detector.getVisitedCount()).toBe(0);
    expect(detector.registerPath('/var/log')).toBe(true);
  });
});
