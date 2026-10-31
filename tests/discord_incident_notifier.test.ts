import { describe, it, expect } from 'vitest';
import { DiscordIncidentNotifier } from '../src/web3/discord_incident_notifier.js';
import { Verdict } from '../src/types.js';

describe('DiscordIncidentNotifier', () => {
  it('formats Discord embed with red color on BLOCK verdict', () => {
    const toolCall = {
      id: 'tx_disc',
      toolName: 'transfer_assets',
      params: {},
      timestamp: Date.now()
    };
    const violations = [
      {
        ruleId: 'r1',
        ruleName: 'Test Rule',
        severity: 'critical' as const,
        verdict: Verdict.BLOCK,
        reason: 'Critical test block'
      }
    ];

    const embed = DiscordIncidentNotifier.formatEmbed(toolCall, violations);
    expect(embed.embeds[0].color).toBe(0xFF0000);
    expect(embed.embeds[0].title).toContain('Execution Blocked');
  });
});
