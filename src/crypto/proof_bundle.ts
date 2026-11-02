import crypto from 'crypto';

export interface AuditRecord {
  id: string;
  action: string;
  timestamp: number;
  data: string;
}

export interface ProofBundle {
  records: AuditRecord[];
  merkleRoot: string;
  signature: string;
  tpmCounter: number;
}

export class CryptoProofBundleExporter {
  public static exportBundle(records: AuditRecord[], privateKeyPem?: string): ProofBundle {
    const hashes = records.map(r => crypto.createHash('sha256').update(JSON.stringify(r)).digest('hex'));
    const combined = hashes.join(':');
    const merkleRoot = crypto.createHash('sha256').update(combined).digest('hex');

    const signature = crypto.createHmac('sha256', 'bundle-secret-key').update(merkleRoot).digest('hex');

    return {
      records,
      merkleRoot,
      signature,
      tpmCounter: Date.now()
    };
  }

  public static verifyBundle(bundle: ProofBundle): boolean {
    const hashes = bundle.records.map(r => crypto.createHash('sha256').update(JSON.stringify(r)).digest('hex'));
    const combined = hashes.join(':');
    const expectedRoot = crypto.createHash('sha256').update(combined).digest('hex');
    return bundle.merkleRoot === expectedRoot;
  }
}
