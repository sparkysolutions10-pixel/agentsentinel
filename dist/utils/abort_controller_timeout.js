export class AbortControllerTimeout {
    static create(timeoutMs) {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            controller.abort();
        }, timeoutMs);
        const cleanup = () => {
            clearTimeout(timer);
        };
        return { controller, cleanup };
    }
}
//# sourceMappingURL=abort_controller_timeout.js.map