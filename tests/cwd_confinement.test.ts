import { describe, it, expect } from 'vitest';
import path from 'path';
import {
  validateWorkingDir,
  isPathInsideRoot,
  createCwdConfinementRule,
  cwdConfinementRule,
} from '../src/shell/cwd_confinement.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Shell CWD Confinement Guard (#54)', () => {
  const dummyRoot = path.resolve('D:/workspace/project');

  describe('isPathInsideRoot helper', () => {
    it('returns true for exact same root directory', () => {
      expect(isPathInsideRoot(dummyRoot, dummyRoot)).toBe(true);
    });

    it('returns true for deep subdirectories inside root', () => {
      const sub = path.join(dummyRoot, 'src', 'utils');
      expect(isPathInsideRoot(sub, dummyRoot)).toBe(true);
    });

    it('returns false for path outside root', () => {
      const outside = path.resolve('D:/workspace/other-repo');
      expect(isPathInsideRoot(outside, dummyRoot)).toBe(false);
    });

    it('prevents sibling directory prefix confusion (e.g. project vs project-secret)', () => {
      const sibling = path.resolve('D:/workspace/project-secret');
      expect(isPathInsideRoot(sibling, dummyRoot)).toBe(false);
    });
  });

  describe('validateWorkingDir', () => {
    it('approves directories within allowedRoots list', () => {
      const roots = [dummyRoot, path.resolve('D:/packages/shared')];
      const validTarget = path.join(roots[1], 'lib');
      const res = validateWorkingDir(validTarget, roots);

      expect(res.allowed).toBe(true);
      expect(res.matchedRoot).toBe(roots[1]);
    });

    it('rejects directories outside allowedRoots list with clear reason', () => {
      const roots = [dummyRoot];
      const invalidTarget = path.resolve('C:/Windows/System32');
      const res = validateWorkingDir(invalidTarget, roots);

      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('escapes designated workspace boundaries');
    });

    it('rejects empty or missing directory input', () => {
      const res = validateWorkingDir('', [dummyRoot]);
      expect(res.allowed).toBe(false);
    });
  });

  describe('SentinelRule evaluation', () => {
    const testRoots = [path.resolve('D:/repo/main')];
    const rule = createCwdConfinementRule({ allowedRoots: testRoots });

    it('permits shell tool executions within allowed workspace root', () => {
      const violation = rule.evaluate({
        id: 'call-valid-cwd',
        toolName: 'bash',
        params: { command: 'npm test', cwd: path.join(testRoots[0], 'tests') },
        timestamp: Date.now(),
      });

      expect(violation).toBeNull();
    });

    it('blocks execution when cwd escapes to system root or other drives', () => {
      const violation = rule.evaluate({
        id: 'call-blocked-cwd',
        toolName: 'bash',
        params: { command: 'cat /etc/passwd', cwd: '/etc' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('high');
      expect(violation?.ruleId).toBe('shell-cwd-confinement');
    });

    it('recognizes workingDir and dir field aliases', () => {
      const violation = rule.evaluate({
        id: 'call-alias-dir',
        toolName: 'powershell',
        params: { commandLine: 'dir', workingDir: 'C:/Windows' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
    });

    it('integrates seamlessly with SentinelEngine pipeline', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(rule);

      const res = await engine.evaluate({
        id: 'engine-cwd-check',
        toolName: 'exec',
        params: { command: 'whoami', cwd: 'D:/unauthorized/secret' },
        timestamp: Date.now(),
      });

      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe(Verdict.BLOCK);
      expect(res.violations[0].ruleId).toBe('shell-cwd-confinement');
    });
  });
});
