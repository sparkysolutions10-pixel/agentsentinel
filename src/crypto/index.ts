/**
 * AgentSentinel - Cryptographic Hardware Enclave & Post-Quantum Domain
 */

export interface HsmProvider {
  id: string;
  slot: number;
  label: string;
  sign(data: Buffer): Promise<Buffer>;
  verify(data: Buffer, signature: Buffer): Promise<boolean>;
}

export interface NitroAttestation {
  document: Buffer;
  pcrValues: Record<number, string>;
  publicKey: Buffer;
  timestamp: number;
}

export interface PostQuantumKey {
  algorithm: 'ML-KEM-768' | 'ML-DSA-65' | 'SPHINCS+';
  publicKey: Buffer;
  privateKey?: Buffer;
}

export interface ZkProof {
  proof: Buffer;
  publicInputs: string[];
  protocol: 'groth16' | 'stark' | 'bulletproof';
}
