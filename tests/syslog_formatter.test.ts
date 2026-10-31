import { describe, it, expect } from 'vitest';
import { SyslogStandardFormatter } from '../src/web3/syslog_formatter.js';
import { Verdict } from '../src/types.js';

describe('SyslogStandardFormatter', () => {
  it('formats RFC 5424 syslog message correctly', () => {
    const toolCall = { id: 'tx_syslog', toolName: 'test_tool', params: {}, timestamp: Date.now() };
    const evaluation = { verdict: Verdict.ALLOW, allowed: true, violations: [] };

    const line = SyslogStandardFormatter.format(toolCall, evaluation, 'node1.cluster');
    expect(line).toMatch(/^<134>1 \d{4}-\d{2}-\d{2}T.* node1\.cluster AgentSentinel/);
    expect(line).toContain('tool=test_tool allowed=true');
  });
});
