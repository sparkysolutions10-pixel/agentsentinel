import { describe, it, expect } from 'vitest';
import { McpDockerContainerMountIsolate } from '../src/mcp/mcp_docker_container_mount_isolate.js';

describe('McpDockerContainerMountIsolate Invariant Suite (#1850)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpDockerContainerMountIsolate.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_DOCKER_CONTAINER_MOUNT_ISOLATE');
    expect(McpDockerContainerMountIsolate.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpDockerContainerMountIsolate.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpDockerContainerMountIsolate.validate('git status && npm run test')).toBe(true);
  });
});
