/**
 * AgentSentinel - Discord Webhook Embed Formatter
 * Creates structured Discord embed messages with color-coded severity indicators
 * for automated Web3 security incident monitoring channels.
 */
import { RuleViolation, ToolCallContext } from '../types.js';
export declare class DiscordIncidentNotifier {
    static formatEmbed(toolCall: ToolCallContext, violations: RuleViolation[]): {
        embeds: {
            title: string;
            color: number;
            fields: ({
                name: string;
                value: string;
                inline: boolean;
            } | {
                name: string;
                value: string;
                inline?: undefined;
            })[];
        }[];
    };
}
//# sourceMappingURL=discord_incident_notifier.d.ts.map