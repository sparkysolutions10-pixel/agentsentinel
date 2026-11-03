import { describe, it, expect } from 'vitest';
import { DockerSocketMountEscapeGuard } from '../src/ast/docker_socket_mount_escape_guard.js';

describe('DockerSocketMountEscapeGuard Invariant Suite (#1867)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DockerSocketMountEscapeGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DOCKER_SOCKET_MOUNT_ESCAPE_GUARD');
    expect(DockerSocketMountEscapeGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DockerSocketMountEscapeGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DockerSocketMountEscapeGuard.validate('git status && npm run test')).toBe(true);
  });
});
