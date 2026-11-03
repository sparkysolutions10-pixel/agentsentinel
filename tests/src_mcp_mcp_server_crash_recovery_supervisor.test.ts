import { describe, it, expect } from 'vitest';
import { McpServerCrashRecoverySupervisor } from '../src/mcp/mcp_server_crash_recovery_supervisor.js';

describe('McpServerCrashRecoverySupervisor Invariant Suite (#1818)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpServerCrashRecoverySupervisor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_SERVER_CRASH_RECOVERY_SUPERVISOR');
    expect(McpServerCrashRecoverySupervisor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpServerCrashRecoverySupervisor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpServerCrashRecoverySupervisor.validate('git status && npm run test')).toBe(true);
  });
});
