import { describe, it, expect } from 'vitest';
import { McpP2pLocalIpcSocketGuard } from '../src/mcp/mcp_p2p_local_ipc_socket_guard.js';

describe('McpP2pLocalIpcSocketGuard Invariant Suite (#1833)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpP2pLocalIpcSocketGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_P2P_LOCAL_IPC_SOCKET_GUARD');
    expect(McpP2pLocalIpcSocketGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpP2pLocalIpcSocketGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpP2pLocalIpcSocketGuard.validate('git status && npm run test')).toBe(true);
  });
});
