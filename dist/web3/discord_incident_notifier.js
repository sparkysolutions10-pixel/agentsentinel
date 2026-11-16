/**
 * AgentSentinel - Discord Webhook Embed Formatter
 * Creates structured Discord embed messages with color-coded severity indicators
 * for automated Web3 security incident monitoring channels.
 */
import { Verdict } from '../types.js';
export class DiscordIncidentNotifier {
    static formatEmbed(toolCall, violations) {
        const isBlock = violations.some(v => v.verdict === Verdict.BLOCK);
        const color = isBlock ? 0xFF0000 : 0xFFA500; // Red or Orange
        return {
            embeds: [
                {
                    title: `🛡️ AgentSentinel Alert: ${isBlock ? 'Execution Blocked' : 'Confirmation Required'}`,
                    color,
                    fields: [
                        { name: 'Tool Invocation', value: `\`${toolCall.toolName}\``, inline: true },
                        { name: 'Timestamp', value: new Date(toolCall.timestamp || Date.now()).toISOString(), inline: true },
                        {
                            name: 'Violations Intercepted',
                            value: violations.map(v => `• **${v.ruleName}**: ${v.reason}`).join('\n')
                        }
                    ]
                }
            ]
        };
    }
}
//# sourceMappingURL=discord_incident_notifier.js.map