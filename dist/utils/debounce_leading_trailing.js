export class DebounceLeadingTrailing {
    static create(fn, delayMs, options = { trailing: true }) {
        let timer = null;
        let leadingExecuted = false;
        return (...args) => {
            const isLeading = options.leading && !leadingExecuted;
            if (isLeading) {
                fn(...args);
                leadingExecuted = true;
            }
            if (timer)
                clearTimeout(timer);
            timer = setTimeout(() => {
                if (options.trailing && !isLeading) {
                    fn(...args);
                }
                leadingExecuted = false;
                timer = null;
            }, delayMs);
        };
    }
}
//# sourceMappingURL=debounce_leading_trailing.js.map