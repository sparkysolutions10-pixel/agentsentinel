/**
 * AgentSentinel - PagerDuty Events API v2 Tripwire Bridge
 * Formats standardized incident trigger payloads for PagerDuty automated paging
 * when high-severity autonomous agent exploits or wallet drains are intercepted.
 */

import { RuleViolation, ToolCallContext } from '../types.js';

export class PagerDutyTripwireBridge {
  public static createTriggerEvent(
    routingKey: string,
    toolCall: ToolCallContext,
    violations: RuleViolation[]
  ) {
    const dedupKey = `agentsentinel_${toolCall.toolName}_${toolCall.id}`;
    const summary = `[AgentSentinel] Security tripwire triggered on ${toolCall.toolName}: ${violations.map(v => v.ruleName).join(', ')}`;

    return {
      routing_key: routingKey,
      event_action: 'trigger',
      dedup_key: dedupKey,
      payload: {
        summary,
        source: 'AgentSentinel-Firewall',
        severity: 'critical',
        custom_details: {
          toolCallId: toolCall.id,
          toolName: toolCall.toolName,
          violations
        }
      }
    };
  }
}
