import { describe, it, expect } from 'vitest';
import { PagerDutyTripwireBridge } from '../src/web3/pagerduty_tripwire_bridge.js';
import { Verdict } from '../src/types.js';

describe('PagerDutyTripwireBridge', () => {
  it('constructs Events API v2 trigger payload cleanly', () => {
    const toolCall = { id: 'call_1', toolName: 'drain_wallet', params: {}, timestamp: Date.now() };
    const violations = [
      {
        ruleId: 'ceiling',
        ruleName: 'Ceiling Guard',
        severity: 'critical' as const,
        verdict: Verdict.BLOCK,
        reason: 'Too large'
      }
    ];

    const event = PagerDutyTripwireBridge.createTriggerEvent('pd_key_123', toolCall, violations);
    expect(event.routing_key).toBe('pd_key_123');
    expect(event.event_action).toBe('trigger');
    expect(event.payload.severity).toBe('critical');
  });
});
