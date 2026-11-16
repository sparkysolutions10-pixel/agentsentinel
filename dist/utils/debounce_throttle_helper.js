/**
 * DebounceThrottleHelper - Debounce and throttle execution helpers.
 */
export class DebounceThrottleHelper {
    static debounce(fn, delayMs) {
        let timer = null;
        const debounced = (...args) => {
            if (timer)
                clearTimeout(timer);
            timer = setTimeout(() => {
                fn(...args);
                timer = null;
            }, delayMs);
        };
        debounced.cancel = () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        };
        return debounced;
    }
    static throttle(fn, intervalMs) {
        let lastExecution = 0;
        let timer = null;
        const throttled = (...args) => {
            const now = Date.now();
            const remaining = intervalMs - (now - lastExecution);
            if (remaining <= 0) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                lastExecution = now;
                fn(...args);
            }
            else if (!timer) {
                timer = setTimeout(() => {
                    lastExecution = Date.now();
                    timer = null;
                    fn(...args);
                }, remaining);
            }
        };
        throttled.cancel = () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        };
        return throttled;
    }
}
//# sourceMappingURL=debounce_throttle_helper.js.map