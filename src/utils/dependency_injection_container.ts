export class DependencyInjectionContainer {
  private services: Map<string, any> = new Map();

  public register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  public resolve<T>(key: string): T {
    if (!this.services.has(key)) {
      throw new Error(`Service not registered: ${key}`);
    }
    return this.services.get(key) as T;
  }

  public has(key: string): boolean {
    return this.services.has(key);
  }
}
