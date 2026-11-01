import { describe, it, expect } from 'vitest';
import { ComplianceFrameworkMapper } from '../src/utils/compliance_framework_mapper.js';

describe('ComplianceFrameworkMapper', () => {
  it('maps categories to standard compliance controls', () => {
    expect(ComplianceFrameworkMapper.getControls('encryption')).toEqual({
      iso27001: 'A.10.1',
      soc2: 'CC6.6'
    });
    expect(ComplianceFrameworkMapper.getControls('unknown')).toBe(null);
  });
});
