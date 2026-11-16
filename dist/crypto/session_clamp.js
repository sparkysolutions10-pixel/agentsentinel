export class SessionAutoExpirationClamp {
    count = 0;
    startTimestamp;
    maxMsgs;
    maxDurationMs;
    constructor(config = {}) {
        this.maxMsgs = config.maxMessages ?? 1000;
        this.maxDurationMs = (config.maxDurationSeconds ?? 3600) * 1000;
        this.startTimestamp = Date.now();
    }
    step() {
        this.count++;
        return this.shouldRekey();
    }
    shouldRekey() {
        if (this.count >= this.maxMsgs)
            return true;
        if (Date.now() - this.startTimestamp >= this.maxDurationMs)
            return true;
        return false;
    }
    reset() {
        this.count = 0;
        this.startTimestamp = Date.now();
    }
}
//# sourceMappingURL=session_clamp.js.map