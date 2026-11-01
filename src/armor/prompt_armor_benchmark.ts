import { createUnifiedPromptArmorRule } from './unified_prompt_armor.js';
import { ToolCallContext } from '../types.js';

export function benchmarkPromptArmor(iterations = 1000): { averageLatencyMs: number; iterations: number } {
  const rule = createUnifiedPromptArmorRule();
  const testContext: ToolCallContext = {
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
