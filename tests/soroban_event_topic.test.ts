import { describe, it, expect } from 'vitest';
import { createSorobanEventTopicValidatorRule } from '../src/web3/soroban_event_topic.js';
import { Verdict } from '../src/types.js';

describe('SorobanEventTopicValidatorRule', () => {
  it('allows valid event topics within Soroban protocol limits', () => {
    const rule = createSorobanEventTopicValidatorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_emit_event',
      params: { topics: ['transfer', 'admin', 'vault'] }
    });
    expect(violation).toBeNull();
  });

  it('blocks events with more than 4 topic segments', () => {
    const rule = createSorobanEventTopicValidatorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_emit_event',
      params: { topics: ['t1', 't2', 't3', 't4', 't5'] } // 5 > 4
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('EVENT_TOPIC_COUNT_EXCEEDED');
  });

  it('blocks events with empty topic segment', () => {
    const rule = createSorobanEventTopicValidatorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_emit_event',
      params: { topics: ['valid', '  '] }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('EMPTY_EVENT_TOPIC_SEGMENT');
  });
});
