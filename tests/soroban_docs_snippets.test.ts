import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SentinelEngine } from '../src/index.js';
import { loadSorobanStrictPreset } from '../src/web3/soroban_preset_loader.js';

describe('SorobanSecurityDocs', () => {
  it('verifies docs/SOROBAN_SECURITY.md exists and contains code samples', () => {
    const docPath = path.resolve(__dirname, '../docs/SOROBAN_SECURITY.md');
    expect(fs.existsSync(docPath)).toBe(true);
    const content = fs.readFileSync(docPath, 'utf-8');
    expect(content).toContain('AgentSentinel - Soroban & Stellar Web3 Security Guide');
    expect(content).toContain('loadSorobanStrictPreset');
  });

  it('runs walkthrough sample snippet without regressions', async () => {
    const engine = new SentinelEngine();
    loadSorobanStrictPreset(engine, {
      maxTransferAmount: 10000,
      maxSlippagePercent: 0.5
    });

    const evaluation = await engine.evaluate({
      id: 'doc_eval_sample',
      toolName: 'soroban_token_transfer',
      params: { to: 'GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3TVN', amount: 500 },
      timestamp: Date.now()
    });

    expect(evaluation.allowed).toBe(true);
  });
});
