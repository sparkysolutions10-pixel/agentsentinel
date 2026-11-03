import { describe, it, expect } from 'vitest';
import { TarballSlipArchiveExtractorGuard } from '../src/ast/tarball_slip_archive_extractor_guard.js';

describe('TarballSlipArchiveExtractorGuard Invariant Suite (#1883)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = TarballSlipArchiveExtractorGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_TARBALL_SLIP_ARCHIVE_EXTRACTOR_GUARD');
    expect(TarballSlipArchiveExtractorGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = TarballSlipArchiveExtractorGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(TarballSlipArchiveExtractorGuard.validate('git status && npm run test')).toBe(true);
  });
});
