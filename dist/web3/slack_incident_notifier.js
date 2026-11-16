/**
 * AgentSentinel - Slack Incident Notification Formatter
 * Formats rich Block Kit message payloads for Slack SecOps alerting channels
 * with incident summaries, severity badges, and tool call details.
 */
export class SlackIncidentNotifier {
    static formatAlert(toolCall, violations) {
        const maxSeverity = violations.some(v => v.severity === 'critical') ? 'CRITICAL' : 'HIGH';
        const emoji = maxSeverity === 'CRITICAL' ? ':rotating_light:' : ':warning:';
        return {
            text: `${emoji} [AgentSentinel] ${maxSeverity} Security Violation on tool \`${toolCall.toolName}\``,
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: `${emoji} AgentSentinel Security Alert: ${maxSeverity}`
                    }
                },
                {
                    type: 'section',
                    fields: [
                        { type: 'mrkdwn', text: `*Tool:* \`${toolCall.toolName}\`` },
                        { type: 'mrkdwn', text: `*Call ID:* \`${toolCall.id}\`` }
                    ]
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Violations:*\n${violations.map(v => `• *[${v.verdict}]* ${v.reason}`).join('\n')}`
                    }
                }
            ]
        };
    }
}
//# sourceMappingURL=slack_incident_notifier.js.map