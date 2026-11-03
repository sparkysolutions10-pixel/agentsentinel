import { describe, it, expect } from 'vitest';
import { McpEnvSecretRedactionFilter } from '../src/mcp/mcp_env_secret_redaction_filter.js';

describe('McpEnvSecretRedactionFilter Invariant Suite (#1816)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpEnvSecretRedactionFilter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_ENV_SECRET_REDACTION_FILTER');
    expect(McpEnvSecretRedactionFilter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpEnvSecretRedactionFilter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpEnvSecretRedactionFilter.validate('git status && npm run test')).toBe(true);
  });
});
