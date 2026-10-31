import { describe, it, expect } from 'vitest';
import { MitreAttackMapper } from '../src/utils/mitre_attack_mapper.js';

describe('MitreAttackMapper', () => {
  it('maps command injection to T1059', () => {
    const tech = MitreAttackMapper.mapEvent('command_injection');
    expect(tech.techniqueId).toBe('T1059');
    expect(tech.tactic).toBe('Execution');
  });

  it('maps credential access to T1552', () => {
    const tech = MitreAttackMapper.mapEvent('credential_access');
    expect(tech.techniqueId).toBe('T1552');
    expect(tech.tactic).toBe('Credential Access');
  });
});
