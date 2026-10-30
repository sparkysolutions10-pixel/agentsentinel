import { describe, it, expect } from 'vitest';
import path from 'path';
import {
  createCwdConfinementRule,
  validateWorkingDir,
} from '../src/shell/cwd_confinement.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('CWD Path Confinement Parent Directory Escapes (#55)', () => {
  const allowedBase = path.resolve('D:/projects/my-app');
  const allowedRoots = [allowedBase];
  const rule = createCwdConfinementRule({ allowedRoots });

  describe('Parent Directory Traversal Pattern Rejections', () => {
    it('blocks relative parent escapes ../.. outside allowed root', () => {
      const target = path.join(allowedBase, '..', '..');
      const res = validateWorkingDir(target, allowedRoots);

      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('escapes designated workspace boundaries');
    });

    it('blocks nested subfolder traversal escaping root (./src/../../outside)', () => {
      const target = path.join(allowedBase, 'src', '..', '..', 'sibling');
      const res = validateWorkingDir(target, allowedRoots);

      expect(res.allowed).toBe(false);
    });

    it('blocks URL-encoded dot-dot-slash representations (%2e%2e/)', () => {
      const target = '%2e%2e/%2e%2e/etc';
      const res = validateWorkingDir(target, allowedRoots);

      expect(res.allowed).toBe(false);
    });

    it('blocks null-byte tainted traversal strings', () => {
      const target = `${allowedBase}\0/../../escaped`;
      const res = validateWorkingDir(target, allowedRoots);

      expect(res.allowed).toBe(false);
    });
  });

  describe('Root Directory Target Blocks', () => {
    it('blocks POSIX root / target', () => {
      const violation = rule.evaluate({
        id: 'eval-posix-root',
        toolName: 'bash',
        params: { command: 'ls', cwd: '/' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('high');
    });

    it('blocks Windows drive roots (C:\\ or D:\\ if outside allowedBase)', () => {
      const violation = rule.evaluate({
        id: 'eval-win-root',
        toolName: 'cmd',
        params: { command: 'dir', cwd: 'C:\\' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
    });

    it('blocks system directories like /etc/shadow or C:\\Windows\\System32', () => {
      const violation = rule.evaluate({
        id: 'eval-sys-dir',
        toolName: 'powershell',
        params: { command: 'Get-ChildItem', cwd: 'C:\\Windows\\System32' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
    });
  });

  describe('Pipeline Integration with SentinelEngine', () => {
    it('engine halts execution when tool context parameter cwd attempts escape', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(rule);

      const evalRes = await engine.evaluate({
        id: 'engine-eval-escape',
        toolName: 'bash',
        params: {
          command: 'rm -rf *',
          cwd: '../../',
        },
        timestamp: Date.now(),
      });

      expect(evalRes.allowed).toBe(false);
      expect(evalRes.verdict).toBe(Verdict.BLOCK);
      expect(evalRes.violations.some((v) => v.ruleId === 'shell-cwd-confinement')).toBe(true);
    });
  });
});
