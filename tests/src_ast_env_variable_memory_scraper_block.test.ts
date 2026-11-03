import { describe, it, expect } from 'vitest';
import { EnvVariableMemoryScraperBlock } from '../src/ast/env_variable_memory_scraper_block.js';

describe('EnvVariableMemoryScraperBlock Invariant Suite (#1878)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = EnvVariableMemoryScraperBlock.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ENV_VARIABLE_MEMORY_SCRAPER_BLOCK');
    expect(EnvVariableMemoryScraperBlock.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = EnvVariableMemoryScraperBlock.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(EnvVariableMemoryScraperBlock.validate('git status && npm run test')).toBe(true);
  });
});
