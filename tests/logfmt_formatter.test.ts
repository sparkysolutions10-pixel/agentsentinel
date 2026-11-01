import { describe, it, expect } from 'vitest';
import { LogfmtFormatter } from '../src/utils/logfmt_formatter.js';

describe('LogfmtFormatter', () => {
  it('formats record into standard key=value logfmt string', () => {
    const formatted = LogfmtFormatter.format({
      ts: 1700000000,
      level: 'info',
      msg: 'Agent invoked tool',
      tool_name: 'soroban_caller'
    });
    expect(formatted).toContain('level=info');
    expect(formatted).toContain('msg="Agent invoked tool"');
    expect(formatted).toContain('tool_name=soroban_caller');
  });
});
