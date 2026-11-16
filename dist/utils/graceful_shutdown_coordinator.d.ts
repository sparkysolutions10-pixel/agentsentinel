export declare class GracefulShutdownCoordinator {
    private hooks;
    register(hook: () => Promise<void> | void): void;
    shutdown(): Promise<void>;
    getHookCount(): number;
}
//# sourceMappingURL=graceful_shutdown_coordinator.d.ts.map