export class RuntimeEnvironmentDetector {
    static detect() {
        if (typeof process?.versions?.bun !== 'undefined')
            return 'Bun';
        if (typeof globalThis?.Deno !== 'undefined')
            return 'Deno';
        if (typeof process !== 'undefined' && process.release?.name === 'node')
            return 'Node';
        if (typeof window !== 'undefined')
            return 'Browser';
        return 'Unknown';
    }
}
//# sourceMappingURL=runtime_environment_detector.js.map