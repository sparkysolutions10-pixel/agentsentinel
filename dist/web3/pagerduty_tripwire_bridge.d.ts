/**
 * AgentSentinel - PagerDuty Events API v2 Tripwire Bridge
 * Formats standardized incident trigger payloads for PagerDuty automated paging
 * when high-severity autonomous agent exploits or wallet drains are intercepted.
 */
import { RuleViolation, ToolCallContext } from '../types.js';
export declare class PagerDutyTripwireBridge {
    static createTriggerEvent(routingKey: string, toolCall: ToolCallContext, violations: RuleViolation[]): {
        routing_key: string;
        event_action: string;
        dedup_key: string;
        payload: {
            summary: string;
            source: string;
            severity: string;
            custom_details: {
                toolCallId: string;
                toolName: string;
                violations: RuleViolation[];
            };
        };
    };
}
//# sourceMappingURL=pagerduty_tripwire_bridge.d.ts.map