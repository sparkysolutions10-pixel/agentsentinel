import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('PromptArmorPresetsLoading', () => {
  it('loads presets/prompt-armor.json successfully', () => {
    const presetPath = path.resolve('presets/prompt-armor.json');
    expect(fs.existsSync(presetPath)).toBe(true);

    const content = JSON.parse(fs.readFileSync(presetPath, 'utf-8'));
    expect(content.version).toBe('1.0.0');
    expect(content.presets).toBeDefined();
    expect(content.presets.strict.rules.length).toBeGreaterThan(0);
    expect(content.presets.balanced.rules.length).toBeGreaterThan(0);
  });
});
