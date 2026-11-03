import { describe, it, expect } from 'vitest';
import { DiskWipeBlockDeviceGuard } from '../src/ast/disk_wipe_block_device_guard.js';

describe('DiskWipeBlockDeviceGuard Invariant Suite (#1856)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DiskWipeBlockDeviceGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DISK_WIPE_BLOCK_DEVICE_GUARD');
    expect(DiskWipeBlockDeviceGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DiskWipeBlockDeviceGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DiskWipeBlockDeviceGuard.validate('git status && npm run test')).toBe(true);
  });
});
