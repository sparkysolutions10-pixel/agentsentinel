import { describe, it, expect } from 'vitest';
import { CryptoProofBundleExporter, AuditRecord } from '../src/crypto/proof_bundle.js';

describe('Proof Bundle Exporter (#853 & #854)', () => {
  it('generates self-verifiable audit archives with valid Merkle roots', () => {
    const records: AuditRecord[] = [
      { id: 'rec-1', action: 'tool_call', timestamp: 1000, data: 'query' },
      { id: 'rec-2', action: 'verdict', timestamp: 1001, data: 'ALLOW' }
    ];

    const bundle = CryptoProofBundleExporter.exportBundle(records);
    expect(bundle.records.length).toBe(2);
    expect(CryptoProofBundleExporter.verifyBundle(bundle)).toBe(true);

    // Tampered record check
    const tampered = JSON.parse(JSON.stringify(bundle));
    tampered.records[0].data = 'MALICIOUS_OVERWRITE';
    expect(CryptoProofBundleExporter.verifyBundle(tampered)).toBe(false);
  });
});
