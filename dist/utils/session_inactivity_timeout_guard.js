export class SessionInactivityTimeoutGuard {
    static isTimedOut(lastActiveMs, maxIdleMs = 900000, nowMs = Date.now()) {
        return nowMs - lastActiveMs >= maxIdleMs;
    }
}
//# sourceMappingURL=session_inactivity_timeout_guard.js.map