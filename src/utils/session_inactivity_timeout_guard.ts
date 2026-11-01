export class SessionInactivityTimeoutGuard {
  public static isTimedOut(lastActiveMs: number, maxIdleMs: number = 900000, nowMs: number = Date.now()): boolean {
    return nowMs - lastActiveMs >= maxIdleMs;
  }
}
