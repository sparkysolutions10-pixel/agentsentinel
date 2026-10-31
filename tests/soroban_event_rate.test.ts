import { describe, it, expect } from 'vitest';
import { createSorobanEventRateDetectorRule } from '../src/web3/soroban_event_rate.js';
import { Verdict } from '../src/types.js';

describe('SorobanEventRateDetectorRule', () => {
  it('allows reasonable number of event emissions', () => {
    const rule = createSorobanEventRateDetectorRule({ maxEventsPerTransaction: 20 });
    const violation = rule.evaluate({
      toolName: 'soroban_process_events',
      params: { eventsCount: 5 }
    });
    expect(violation).toBeNull();
  });

  it('blocks anomalous event emission bursts', () => {
    const rule = createSorobanEventRateDetectorRule({ maxEventsPerTransaction: 20 });
    const violation = rule.evaluate({
      toolName: 'soroban_process_events',
      params: { eventsCount: 150 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('ANOMALOUS_EVENT_RATE');
  });
});
