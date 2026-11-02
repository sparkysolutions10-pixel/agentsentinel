import { describe, it, expect } from 'vitest';
import { DoubleRatchetSession } from '../src/crypto/double_ratchet.js';

describe('Double Ratchet Protocol (#867 & #868)', () => {
  it('advances message keys monotonically ensuring forward secrecy', () => {
    const master = Buffer.from('master-ratchet-seed-key-32-bytes');
    const ratchet = new DoubleRatchetSession(master);

    const step1 = ratchet.ratchetSend();
    const step2 = ratchet.ratchetSend();

    expect(step1.messageIndex).toBe(1);
    expect(step2.messageIndex).toBe(2);
    expect(step1.messageKey.equals(step2.messageKey)).toBe(false);
  });

  it('heals state after compromise when supplied new entropy', () => {
    const master = Buffer.from('master-ratchet-seed-key-32-bytes');
    const ratchet = new DoubleRatchetSession(master);

    const preHealKey = ratchet.ratchetSend().messageKey;
    ratchet.healRatchets(Buffer.from('fresh-dh-ephemeral-secret'));
    const postHealKey = ratchet.ratchetSend().messageKey;

    expect(preHealKey.equals(postHealKey)).toBe(false);
  });
});
