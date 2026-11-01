import { describe, it, expect } from 'vitest';
import { AbortControllerTimeout } from '../src/utils/abort_controller_timeout.js';

describe('AbortControllerTimeout', () => {
  it('aborts after specified delay', async () => {
    const { controller, cleanup } = AbortControllerTimeout.create(30);
    expect(controller.signal.aborted).toBe(false);
    await new Promise(r => setTimeout(r, 80));
    expect(controller.signal.aborted).toBe(true);
    cleanup();
  });
});
