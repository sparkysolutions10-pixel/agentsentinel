import { describe, it, expect } from 'vitest';
import { Base64InstructionSniffer } from '../src/utils/base64_instruction_sniffer.js';

describe('Base64InstructionSniffer', () => {
  it('detects embedded base64 shell payloads', () => {
    // "rm -rf / --no-preserve-root" in base64 is "cm0gLXJmIC8gLS1uby1wcmVzZXJ2ZS1yb290"
    const input = 'Execute command: cm0gLXJmIC8gLS1uby1wcmVzZXJ2ZS1yb290';
    const detected = Base64InstructionSniffer.extractDecodedSuspiciousStrings(input);
    expect(detected.length).toBe(1);
    expect(detected[0]).toContain('rm -rf');
  });

  it('ignores benign inputs and safe base64 tokens', () => {
    const input = 'Normal text without encoded payloads';
    expect(Base64InstructionSniffer.extractDecodedSuspiciousStrings(input)).toEqual([]);
  });
});
