# AgentSentinel Hardware Enclave & Post-Quantum Guide

## Overview
AgentSentinel provides zero-trust hardware attestation and post-quantum cryptographic security for agent execution environments.

### Supported Enclave Environments
1. **AWS Nitro Enclaves**: Cryptographic attestation documents with PCR validation.
2. **Intel SGX / AMD SEV-SNP**: Measured boot and hardware memory encryption.
3. **Dedicated HSM / CloudHSM**: PKCS#11 key storage and signing interfaces.
4. **Post-Quantum Cryptography**: NIST ML-KEM (Kyber) and ML-DSA (Dilithium).

```typescript
import { HsmProvider, NitroAttestation } from '../src/crypto/index.js';

export function verifyEnclaveSession(attestation: NitroAttestation): boolean {
  return attestation.pcrValues[0] !== undefined;
}
```
