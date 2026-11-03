import { describe, it, expect } from 'vitest';
import { McpCliConfigJsonValidator } from '../src/mcp/mcp_cli_config_json_validator.js';

describe('McpCliConfigJsonValidator Invariant Suite (#1837)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpCliConfigJsonValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_CLI_CONFIG_JSON_VALIDATOR');
    expect(McpCliConfigJsonValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpCliConfigJsonValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpCliConfigJsonValidator.validate('git status && npm run test')).toBe(true);
  });
});
