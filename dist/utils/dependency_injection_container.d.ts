export declare class DependencyInjectionContainer {
    private services;
    register<T>(key: string, instance: T): void;
    resolve<T>(key: string): T;
    has(key: string): boolean;
}
//# sourceMappingURL=dependency_injection_container.d.ts.map