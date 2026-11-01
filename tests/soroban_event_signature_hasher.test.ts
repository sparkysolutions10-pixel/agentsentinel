import { describe, it, expect } from 'vitest';
import { SorobanEventSignatureHasher } from '../src/utils/soroban_event_signature_hasher.js';

describe('SorobanEventSignatureHasher', () => {
  it('computes 64-character sha256 hash of event topic', () => {
    const hash = SorobanEventSignatureHasher.hashTopic('transfer(address,address,i128)');
    expect(hash.length).toBe(64);
  });
});
