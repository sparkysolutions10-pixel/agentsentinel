import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { loadSorobanStrictPreset } from '../src/web3/soroban_preset_loader.js';
import fs from 'fs';
import path from 'path';

describe('SorobanStrictPreset', () => {
  it('loads preset rules cleanly into SentinelEngine', () => {
    const engine = new SentinelEngine();
    loadSorobanStrictPreset(engine, { maxTransferAmount: 5000 });
    const rules = engine.registry.getAll();
    expect(rules.length).toBeGreaterThanOrEqual(6);
    expect(rules.some((r: any) => r.id === 'soroban-token-transfer-ceiling')).toBe(true);
    expect(rules.some((r: any) => r.id === 'soroban-slippage-enforcer')).toBe(true);
  });

  it('validates presets/soroban-strict.json exists and is valid JSON', () => {
    const presetPath = path.resolve(__dirname, '../presets/soroban-strict.json');
    expect(fs.existsSync(presetPath)).toBe(true);
    const content = fs.readFileSync(presetPath, 'utf-8');
    const parsed = JSON.parse(content);
    expect(parsed.name).toBe('soroban-strict');
    expect(parsed.rules).toBeDefined();
  });
});
