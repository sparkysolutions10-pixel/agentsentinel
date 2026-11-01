import { describe, it, expect } from 'vitest';
import { DependencyInjectionContainer } from '../src/utils/dependency_injection_container.js';

describe('DependencyInjectionContainer', () => {
  it('registers and resolves singletons', () => {
    const di = new DependencyInjectionContainer();
    di.register('database', { status: 'connected' });
    expect(di.resolve<{ status: string }>('database').status).toBe('connected');
    expect(() => di.resolve('missing')).toThrow();
  });
});
