import { describe, it, expect } from 'vitest';
import { PciDssCardNumberMemoryScrubber } from '../src/fintech/pci_dss_card_number_memory_scrubber.js';

describe('PciDssCardNumberMemoryScrubber Invariant Suite (#1960)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PciDssCardNumberMemoryScrubber.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PCI_DSS_CARD_NUMBER_MEMORY_SCRUBBER');
    expect(PciDssCardNumberMemoryScrubber.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PciDssCardNumberMemoryScrubber.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PciDssCardNumberMemoryScrubber.validate('git status && npm run test')).toBe(true);
  });
});
