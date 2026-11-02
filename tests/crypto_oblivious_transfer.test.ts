import { describe, it, expect } from 'vitest';
import { ObliviousTransferProtocol } from '../src/crypto/oblivious_transfer.js';

describe('1-out-of-2 Oblivious Transfer (#831 & #832)', () => {
  it('transfers chosen message while concealing selection from sender', () => {
    const res0 = ObliviousTransferProtocol.transfer1Of2('RULE_ALLOW', 'RULE_BLOCK', 0);
    expect(res0.receivedMessage).toBe('RULE_ALLOW');
    expect(res0.senderLearnedChoice).toBe(false);

    const res1 = ObliviousTransferProtocol.transfer1Of2('RULE_ALLOW', 'RULE_BLOCK', 1);
    expect(res1.receivedMessage).toBe('RULE_BLOCK');
    expect(res1.senderLearnedChoice).toBe(false);
  });
});
