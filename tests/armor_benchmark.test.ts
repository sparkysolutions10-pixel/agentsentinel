import { describe, it, expect } from 'vitest';
import { benchmarkPromptArmor } from '../src/armor/prompt_armor_benchmark.js';

describe('PromptArmorBenchmark', () => {
  it('achieves sub-millisecond execution (< 0.5ms per iteration)', () => {
    const res = benchmarkPromptArmor(1000);
    expect(res.iterations).toBe(1000);
    expect(res.averageLatencyMs).toBeLessThan(0.5);
  });
});
