import { describe, it, expect } from 'vitest';
import { SessionInactivityTimeoutGuard } from '../src/utils/session_inactivity_timeout_guard.js';

describe('SessionInactivityTimeoutGuard', () => {
  it('checks session idle timeout', () => {
    expect(SessionInactivityTimeoutGuard.isTimedOut(1000, 5000, 7000)).toBe(true);
    expect(SessionInactivityTimeoutGuard.isTimedOut(1000, 5000, 3000)).toBe(false);
  });
});
