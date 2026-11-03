import { describe, it, expect } from 'vitest';
import { McpWildcardPermissionAnalyzer } from '../src/mcp/mcp_wildcard_permission_analyzer.js';

describe('McpWildcardPermissionAnalyzer Invariant Suite (#1845)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpWildcardPermissionAnalyzer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_WILDCARD_PERMISSION_ANALYZER');
    expect(McpWildcardPermissionAnalyzer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpWildcardPermissionAnalyzer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpWildcardPermissionAnalyzer.validate('git status && npm run test')).toBe(true);
  });
});
