export class GracefulShutdownCoordinator {
    hooks = [];
    register(hook) {
        this.hooks.push(hook);
    }
    async shutdown() {
        const list = [...this.hooks].reverse();
        for (const hook of list) {
            try {
                await hook();
            }
            catch (err) {
                // Continue cleaning other hooks
            }
        }
    }
    getHookCount() {
        return this.hooks.length;
    }
}
//# sourceMappingURL=graceful_shutdown_coordinator.js.map