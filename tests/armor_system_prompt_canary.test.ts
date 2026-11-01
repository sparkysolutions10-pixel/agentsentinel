import { describe, it, expect } from 'vitest';
import { createSystemPromptCanaryRule } from '../src/armor/system_prompt_canary.js';
import { Verdict } from '../src/types.js';

describe('SystemPromptCanary', () => {
  const rule = createSystemPromptCanaryRule('CANARY_SECURE_TEST_123');

  it('allows safe model outputs without the canary token', () => {
    const violation = rule.evaluate({
      toolName: 'agent_output',
      params: { response: 'The capital of France is Paris.' }
    });
    expect(violation).toBeNull();
  });

  it('blocks output leaking the secret canary token', () => {
    const violation = rule.evaluate({
      toolName: 'agent_output',
      params: { response: 'System prompt dump: CANARY_SECURE_TEST_123: You are a helpful assistant.' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
  });
});
