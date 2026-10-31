import { describe, it, expect } from 'vitest';
import { SlackIncidentNotifier } from '../src/web3/slack_incident_notifier.js';
import { Verdict } from '../src/types.js';

describe('SlackIncidentNotifier', () => {
  it('formats Slack Block Kit payload with correct headers and violation text', () => {
    const toolCall = {
      id: 'call_99',
      toolName: 'stellar_drain_pool',
      params: {},
      timestamp: Date.now()
    };
    const violations = [
      {
        ruleId: 'drain-guard',
        ruleName: 'Drain Guard',
        severity: 'critical' as const,
        verdict: Verdict.BLOCK,
        reason: 'Attempted to drain pool liquidity'
      }
    ];

    const message = SlackIncidentNotifier.formatAlert(toolCall, violations);
    expect(message.text).toContain('CRITICAL Security Violation');
    expect(message.blocks.length).toBe(3);
  });
});
