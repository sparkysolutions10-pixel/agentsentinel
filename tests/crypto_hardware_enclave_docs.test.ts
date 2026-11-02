import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Hardware Enclave Documentation (#881 & #882)', () => {
  it('verifies docs/HARDWARE_ENCLAVE.md exists and contains required technical guidance', () => {
    const docPath = path.resolve(__dirname, '../docs/HARDWARE_ENCLAVE.md');
    expect(fs.existsSync(docPath)).toBe(true);

    const content = fs.readFileSync(docPath, 'utf8');
    expect(content).toContain('AWS Nitro Enclaves');
    expect(content).toContain('Intel SGX');
    expect(content).toContain('Post-Quantum');
  });
});
