import { createUnifiedPromptArmorRule } from './unified_prompt_armor.js';
export function benchmarkPromptArmor(iterations = 1000) {
    const rule = createUnifiedPromptArmorRule();
    const testContext = {
        id: 'benchmark-context',
        toolName: 'prompt_filter',
        params: { text: 'The quick brown fox jumps over the lazy dog and asks a normal question.' },
        timestamp: Date.now()
    };
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        rule.evaluate(testContext);
    }
    const totalMs = performance.now() - start;
    const averageLatencyMs = totalMs / iterations;
    return { averageLatencyMs, iterations };
}
//# sourceMappingURL=prompt_armor_benchmark.js.map