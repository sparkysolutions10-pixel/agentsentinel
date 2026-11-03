import { describe, it, expect } from 'vitest';
import { McpStdioProcessConfinement } from '../src/mcp/mcp_stdio_process_confinement.js';

describe('McpStdioProcessConfinement Invariant Suite (#1806)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpStdioProcessConfinement.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_STDIO_PROCESS_CONFINEMENT');
    expect(McpStdioProcessConfinement.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpStdioProcessConfinement.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpStdioProcessConfinement.validate('git status && npm run test')).toBe(true);
  });
});
