import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { SmpcConsistencyChecker, SmpcShare } from '../src/crypto/smpc_consistency.js';

describe('SMPC Consistency Checker (#833 & #834)', () => {
  it('detects corrupted shares and evicts malicious participants', () => {
    const salt = 'session-salt-123';
    const validHash = crypto.createHash('sha256').update(`42:${salt}`).digest('hex');

    const shares: SmpcShare[] = [
      { participantId: 'node-1', shareIndex: 1, value: 42, commitmentHash: validHash },
      { participantId: 'node-2', shareIndex: 2, value: 99, commitmentHash: 'tampered-hash' }
    ];

    const result = SmpcConsistencyChecker.isolateMaliciousParties(shares, salt);
    expect(result.validShares.length).toBe(1);
    expect(result.evictedParties).toEqual(['node-2']);
  });
});
