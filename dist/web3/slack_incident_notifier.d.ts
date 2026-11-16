/**
 * AgentSentinel - Slack Incident Notification Formatter
 * Formats rich Block Kit message payloads for Slack SecOps alerting channels
 * with incident summaries, severity badges, and tool call details.
 */
import { RuleViolation, ToolCallContext } from '../types.js';
export declare class SlackIncidentNotifier {
    static formatAlert(toolCall: ToolCallContext, violations: RuleViolation[]): {
        text: string;
        blocks: ({
            type: string;
            text: {
                type: string;
                text: string;
            };
            fields?: undefined;
        } | {
            type: string;
            fields: {
                type: string;
                text: string;
            }[];
            text?: undefined;
        })[];
    };
}
//# sourceMappingURL=slack_incident_notifier.d.ts.map