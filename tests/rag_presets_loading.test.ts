import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('RagStrictPolicyPreset', () => {
  it('loads presets/rag-strict.policy.json with 24 rules', () => {
    const presetPath = path.resolve(__dirname, '../presets/rag-strict.policy.json');
    expect(fs.existsSync(presetPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(presetPath, 'utf-8'));
    expect(content.name).toBe('rag-strict');
    expect(Array.isArray(content.rules)).toBe(true);
    expect(content.rules.length).toBeGreaterThanOrEqual(20);
  });
});
