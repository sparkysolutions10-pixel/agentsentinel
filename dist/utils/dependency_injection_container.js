export class DependencyInjectionContainer {
    services = new Map();
    register(key, instance) {
        this.services.set(key, instance);
    }
    resolve(key) {
        if (!this.services.has(key)) {
            throw new Error(`Service not registered: ${key}`);
        }
        return this.services.get(key);
    }
    has(key) {
        return this.services.has(key);
    }
}
//# sourceMappingURL=dependency_injection_container.js.map