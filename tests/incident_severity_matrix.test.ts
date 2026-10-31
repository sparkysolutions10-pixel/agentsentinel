import { describe, it, expect } from 'vitest';
import { IncidentSeverityMatrix } from '../src/utils/incident_severity_matrix.js';

describe('IncidentSeverityMatrix', () => {
  it('evaluates critical incidents as P1 with 15 min SLA', () => {
    const res = IncidentSeverityMatrix.evaluate('CRITICAL', 'HIGH');
    expect(res.priority).toBe('P1');
    expect(res.slaMinutes).toBe(15);
    expect(res.requiresPagerDuty).toBe(true);
  });

  it('evaluates low impact incidents as P4 with 24h SLA', () => {
    const res = IncidentSeverityMatrix.evaluate('LOW', 'LOW');
    expect(res.priority).toBe('P4');
    expect(res.slaMinutes).toBe(1440);
    expect(res.requiresPagerDuty).toBe(false);
  });
});
