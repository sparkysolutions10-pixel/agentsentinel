import { describe, it, expect } from 'vitest';
import { createTravelRuleInspector } from '../src/web3/travel_rule_inspector.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('TravelRulePayloadInspector', () => {
  const rule = createTravelRuleInspector({ thresholdAmount: 1000 });

  it('allows sub-threshold transfers without travel rule metadata', () => {
    const context: ToolCallContext = {
      id: 'tx_sub_threshold',
      toolName: 'stellar_transfer',
      params: { to: 'GBBD...', amount: 500 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('allows high-value transfer with valid travel rule metadata', () => {
    const context: ToolCallContext = {
      id: 'tx_compliant_high_value',
      toolName: 'stellar_transfer',
      params: {
        to: 'GBBD...',
        amount: 25000,
        travelRule: { originator: 'Entity A', beneficiary: 'Entity B' }
      },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks high-value transfer missing travel rule metadata', () => {
    const context: ToolCallContext = {
      id: 'tx_non_compliant_high_value',
      toolName: 'stellar_transfer',
      params: { to: 'GBBD...', amount: 5000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('TRAVEL_RULE_METADATA_MISSING');
  });
});
