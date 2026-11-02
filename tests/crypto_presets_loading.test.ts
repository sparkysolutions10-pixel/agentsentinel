import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Hardware Crypto Presets Loader (#879 & #880)', () => {
  it('loads and validates hardware-enclave.json configuration schema', () => {
    const presetPath = path.resolve(__dirname, '../presets/hardware-enclave.json');
    expect(fs.existsSync(presetPath)).toBe(true);

    const raw = fs.readFileSync(presetPath, 'utf8');
    const config = JSON.parse(raw);
    expect(config.name).toBe('hardware-enclave-preset');
    expect(config.profiles['military-grade'].postQuantumOnly).toBe(true);
    expect(config.profiles['confidential-cloud'].requireHardwareAttestation).toBe(true);
    expect(config.profiles['software-fallback'].requireHardwareAttestation).toBe(false);
  });
});
