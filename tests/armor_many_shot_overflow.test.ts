import { describe, it, expect } from 'vitest';
import { createManyShotOverflowGuardRule } from '../src/armor/many_shot_overflow_guard.js';
import { Verdict } from '../src/types.js';

describe('ManyShotOverflowGuard', () => {
  const rule = createManyShotOverflowGuardRule(1000, 10);

  it('allows normal prompt length and turn count', () => {
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: 'Short prompt under limits.' }
    });
    expect(violation).toBeNull();
  });

  it('blocks character length overflow (>1000 chars)', () => {
    const huge = 'A'.repeat(1200);
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: huge }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks excessive fake dialog turns (>10 turns)', () => {
    const turns = 'User: hi\nAssistant: hello\n'.repeat(8);
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: turns }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
