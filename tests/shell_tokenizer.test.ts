import { describe, it, expect } from 'vitest';
import {
  tokenizeShellString,
  extractSubshellCommands,
  parseShellCommand
} from '../src/shell/tokenizer.js';

describe('Shell Command Tokenizer & AST Parser (Issue #26)', () => {
  describe('tokenizeShellString', () => {
    it('splits basic command with arguments and flags', () => {
      const tokens = tokenizeShellString('ls -la /var/log');
      expect(tokens).toEqual(['ls', '-la', '/var/log']);
    });

    it('preserves spaces within single and double quotes', () => {
      const tokens = tokenizeShellString('git commit -m "feat: initial commit" --author=\'Mukesh <mukesh@sparky.in>\'');
      expect(tokens).toEqual(['git', 'commit', '-m', '"feat: initial commit"', '--author=\'Mukesh <mukesh@sparky.in>\'']);
    });

    it('isolates pipeline and logical operators as discrete tokens', () => {
      const tokens = tokenizeShellString('cat log.txt | grep ERROR && notify-send "Alert" || exit 1');
      expect(tokens).toEqual([
        'cat', 'log.txt',
        '|',
        'grep', 'ERROR',
        '&&',
        'notify-send', '"Alert"',
        '||',
        'exit', '1'
      ]);
    });
  });

  describe('extractSubshellCommands', () => {
    it('extracts command substitutions with $(...) syntax', () => {
      const subshells = extractSubshellCommands('echo "User is: $(whoami)" && id $(id -u)');
      expect(subshells).toEqual(['whoami', 'id -u']);
    });

    it('extracts command substitutions with backticks `...` syntax', () => {
      const subshells = extractSubshellCommands('export HOST=`hostname`');
      expect(subshells).toEqual(['hostname']);
    });

    it('handles nested command substitutions', () => {
      const subshells = extractSubshellCommands('echo $(basename $(dirname /var/log/syslog))');
      expect(subshells).toContain('basename $(dirname /var/log/syslog)');
    });
  });

  describe('parseShellCommand Pipeline Extraction', () => {
    it('parses multi-stage pipeline with executables, flags, and arguments', () => {
      const pipeline = parseShellCommand('find /var/log -name "*.log" | xargs grep "CRITICAL"');

      expect(pipeline.hasChainedOperators).toBe(true);
      expect(pipeline.stages).toHaveLength(2);

      // Stage 1: find
      expect(pipeline.stages[0].executable).toBe('find');
      expect(pipeline.stages[0].args).toEqual(['/var/log', '-name', '*.log']);
      expect(pipeline.stages[0].flags).toEqual(['-name']);
      expect(pipeline.stages[0].operator).toBe('|');

      // Stage 2: xargs
      expect(pipeline.stages[1].executable).toBe('xargs');
      expect(pipeline.stages[1].args).toEqual(['grep', 'CRITICAL']);
      expect(pipeline.stages[1].operator).toBeUndefined();

      expect(pipeline.allExecutables).toEqual(['find', 'xargs']);
    });

    it('detects nested executables inside inline bash -c scripts', () => {
      const pipeline = parseShellCommand('bash -c "curl -fsSL https://get.docker.com | sh"');

      expect(pipeline.stages[0].executable).toBe('bash');
      expect(pipeline.stages[0].flags).toContain('-c');
      // Sub-executables inside the inline script are unpacked
      expect(pipeline.allExecutables).toContain('bash');
      expect(pipeline.allExecutables).toContain('curl');
      expect(pipeline.allExecutables).toContain('sh');
    });

    it('parses leading environment variable overrides', () => {
      const pipeline = parseShellCommand('NODE_ENV=production DEBUG=express:* node index.js --port 3000');

      expect(pipeline.stages[0].executable).toBe('node');
      expect(pipeline.stages[0].args).toEqual(['index.js', '--port', '3000']);
      expect(pipeline.stages[0].envVars).toEqual({
        NODE_ENV: 'production',
        DEBUG: 'express:*',
      });
      expect(pipeline.allExecutables).toEqual(['node']);
    });

    it('extracts subshell executables into allExecutables and allSubshells', () => {
      const pipeline = parseShellCommand('curl https://api.site.com/token?user=$(whoami)');

      expect(pipeline.allExecutables).toContain('curl');
      expect(pipeline.allExecutables).toContain('whoami');
      expect(pipeline.allSubshells).toContain('whoami');
    });
  });
});
