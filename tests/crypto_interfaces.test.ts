import { describe, it, expect } from 'vitest';
import { HsmProvider, NitroAttestation, PostQuantumKey, ZkProof } from '../src/crypto/index.js';

describe('Crypto Public Exports Strict Typecheck (#883 & #884)', () => {
  it('validates HsmProvider and NitroAttestation structure', () => {
    const mockHsm: HsmProvider = {
      id: 'cloud-hsm-1',
      slot: 0,
      label: 'agentsentinel-root-key',
      sign: async (b) => b,
      verify: async () => true,
    };
    expect(mockHsm.id).toBe('cloud-hsm-1');

    const attestation: NitroAttestation = {
      document: Buffer.from('test-doc'),
      pcrValues: { 0: 'pcr0-hash', 1: 'pcr1-hash', 2: 'pcr2-hash' },
      publicKey: Buffer.from('enclave-pub'),
      timestamp: Date.now(),
    };
    expect(attestation.pcrValues[0]).toBe('pcr0-hash');
  });

  it('validates PostQuantumKey and ZkProof contracts', () => {
    const pqk: PostQuantumKey = {
      algorithm: 'ML-KEM-768',
      publicKey: Buffer.from('ml-kem-pub'),
    };
    expect(pqk.algorithm).toBe('ML-KEM-768');

    const zk: ZkProof = {
      proof: Buffer.from('proof-bytes'),
      publicInputs: ['0x123', '0x456'],
      protocol: 'stark',
    };
    expect(zk.protocol).toBe('stark');
  });
});
