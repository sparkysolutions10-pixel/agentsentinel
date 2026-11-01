export type RuntimeEnv = 'Bun' | 'Deno' | 'Node' | 'Browser' | 'Unknown';

export class RuntimeEnvironmentDetector {
  public static detect(): RuntimeEnv {
    if (typeof (process as any)?.versions?.bun !== 'undefined') return 'Bun';
    if (typeof (globalThis as any)?.Deno !== 'undefined') return 'Deno';
    if (typeof process !== 'undefined' && process.release?.name === 'node') return 'Node';
    if (typeof window !== 'undefined') return 'Browser';
    return 'Unknown';
  }
}
