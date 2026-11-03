import { describe, it, expect } from 'vitest';
import { HardwareWalletUsbHidSanitizer } from '../src/web3/hardware_wallet_usb_hid_sanitizer.js';

describe('HardwareWalletUsbHidSanitizer Invariant Suite (#1782)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = HardwareWalletUsbHidSanitizer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_HARDWARE_WALLET_USB_HID_SANITIZER');
    expect(HardwareWalletUsbHidSanitizer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = HardwareWalletUsbHidSanitizer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(HardwareWalletUsbHidSanitizer.validate('git status && npm run test')).toBe(true);
  });
});
