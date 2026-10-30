import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { runCli, VERSION, CLI_EXIT_CODES } from '../src/cli/index.js';

describe('AgentSentinel CLI Audit Runner (#115)', () => {
  it('outputs version string with code 0 on --version', async () => {
    let out = '';
    const code = await runCli(['--version'], (msg) => (out += msg));

    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
    expect(out).toContain(`agentsentinel v${VERSION}`);
  });

  it('outputs help manual with code 0 on --help', async () => {
    let out = '';
    const code = await runCli(['--help'], (msg) => (out += msg));

    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
    expect(out).toContain('AgentSentinel CLI');
    expect(out).toContain('Usage:');
  });

  it('audits clean command returning exit code 0', async () => {
    let out = '';
    const code = await runCli(['check', '--cmd', 'ls -la /home/user'], (msg) => (out += msg));

    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
    expect(out).toContain('PASSED');
    expect(out).toContain('ALLOW');
  });

  it('audits destructive command returning exit code 1 (BLOCKED)', async () => {
    let out = '';
    const code = await runCli(['check', '--cmd', 'rm -rf /'], (msg) => (out += msg));

    expect(code).toBe(CLI_EXIT_CODES.VIOLATION_BLOCKED);
    expect(out).toContain('BLOCK');
    expect(out).toContain('Destructive');
  });

  it('respects --no-strict flag returning exit code 0 even on violations', async () => {
    let out = '';
    const code = await runCli(['check', '--cmd', 'rm -rf /', '--no-strict'], (msg) => (out += msg));

    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
    expect(out).toContain('BLOCK');
  });

  it('audits tool execution with JSON params via eval command', async () => {
    let out = '';
    const code = await runCli(
      ['eval', '--tool', 'fs_read', '--params', '{"path":"/etc/shadow"}'],
      (msg) => (out += msg)
    );

    expect(code).toBe(CLI_EXIT_CODES.VIOLATION_BLOCKED);
    expect(out).toContain('BLOCK');
  });

  it('returns FILE_NOT_FOUND (code 2) when auditing a non-existent file', async () => {
    let err = '';
    const code = await runCli(['audit', 'missing_file_never_exists.sh'], () => {}, (msg) => (err += msg));

    expect(code).toBe(CLI_EXIT_CODES.FILE_NOT_FOUND);
    expect(err).toContain('File not found');
  });

  it('audits audit-log JSONL files and identifies blocked violation counts', async () => {
    const tmpLog = path.join(process.cwd(), 'temp_test_audit.jsonl');
    const logData = [
      JSON.stringify({ verdict: 'ALLOW', toolName: 'read_doc' }),
      JSON.stringify({ verdict: 'BLOCK', toolName: 'format_drive', violations: [{ reason: 'Drive wipe blocked' }] }),
      JSON.stringify({ verdict: 'ALLOW', toolName: 'query_db' }),
    ].join('\n');

    fs.writeFileSync(tmpLog, logData, 'utf8');

    try {
      let out = '';
      const code = await runCli(['audit-log', tmpLog], (msg) => (out += msg));

      expect(code).toBe(CLI_EXIT_CODES.VIOLATION_BLOCKED);
      expect(out).toContain('Scanned 3 event(s)');
      expect(out).toContain('found 1 blocked violation(s)');
    } finally {
      if (fs.existsSync(tmpLog)) fs.unlinkSync(tmpLog);
    }
  });
});
