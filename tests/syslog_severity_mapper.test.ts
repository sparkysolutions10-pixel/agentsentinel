import { describe, it, expect } from 'vitest';
import { SyslogSeverityMapper } from '../src/utils/syslog_severity_mapper.js';

describe('SyslogSeverityMapper', () => {
  it('maps severities to syslog integer codes', () => {
    expect(SyslogSeverityMapper.toSyslogSeverity('critical')).toBe(2);
    expect(SyslogSeverityMapper.toSyslogSeverity('high')).toBe(3);
    expect(SyslogSeverityMapper.toSyslogSeverity('low')).toBe(6);
  });
});
