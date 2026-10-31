import { describe, it, expect } from 'vitest';
import { EphemeralKeyRotationManager } from '../src/web3/ephemeral_key_rotation.js';

describe('EphemeralKeyRotationManager', () => {
  it('allows active key within transaction and time bounds', () => {
    const manager = new EphemeralKeyRotationManager({ maxTransactions: 10 });
    manager.registerKey('key_1');
    manager.recordTransaction('key_1');

    const status = manager.isRotationRequired('key_1');
    expect(status.required).toBe(false);
  });

  it('requires rotation when transaction threshold is reached', () => {
    const manager = new EphemeralKeyRotationManager({ maxTransactions: 3 });
    manager.registerKey('key_2');
    manager.recordTransaction('key_2');
    manager.recordTransaction('key_2');
    manager.recordTransaction('key_2');

    const status = manager.isRotationRequired('key_2');
    expect(status.required).toBe(true);
    expect(status.reason).toContain('Max transaction count reached');
  });
});
