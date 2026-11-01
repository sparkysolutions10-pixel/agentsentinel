import { describe, it, expect } from 'vitest';
import { RuntimeEnvironmentDetector } from '../src/utils/runtime_environment_detector.js';

describe('RuntimeEnvironmentDetector', () => {
  it('identifies runtime engine', () => {
    const env = RuntimeEnvironmentDetector.detect();
    expect(['Node', 'Bun', 'Deno', 'Browser']).toContain(env);
  });
});
