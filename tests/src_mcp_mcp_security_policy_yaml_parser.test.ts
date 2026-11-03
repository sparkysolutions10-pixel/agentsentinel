import { describe, it, expect } from 'vitest';
import { McpSecurityPolicyYamlParser } from '../src/mcp/mcp_security_policy_yaml_parser.js';

describe('McpSecurityPolicyYamlParser Invariant Suite (#1853)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpSecurityPolicyYamlParser.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_SECURITY_POLICY_YAML_PARSER');
    expect(McpSecurityPolicyYamlParser.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpSecurityPolicyYamlParser.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpSecurityPolicyYamlParser.validate('git status && npm run test')).toBe(true);
  });
});
