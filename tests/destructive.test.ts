import { describe, it, expect } from 'vitest';
import {
  detectDestructiveDeletion,
  createDestructiveDeletionRule
} from '../src/shell/destructive.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Destructive Command Rule - rm -rf & shred (Issue #28)', () => {
  describe('detectDestructiveDeletion', () => {
    it('blocks classic rm -rf / and rm -rf ~', () => {
      expect(detectDestructiveDeletion('rm -rf /').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rf /*').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rf ~').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rf $HOME').isDestructive).toBe(true);
    });

    it('blocks split and long flag variations (rm -r -f, rm --recursive --force)', () => {
      expect(detectDestructiveDeletion('rm -r -f /').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -f -r /').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm --recursive --force /').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -fr /').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rfv /').isDestructive).toBe(true);
    });

    it('blocks recursive deletion of critical system directories', () => {
      expect(detectDestructiveDeletion('rm -rf /etc').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rf /boot').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rf /var/log/*').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rf /usr/bin').isDestructive).toBe(true);
    });

    it('blocks shred attacks targeting raw devices and system configs', () => {
      expect(detectDestructiveDeletion('shred -u -z /dev/sda').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('shred -n 5 /dev/nvme0n1').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('shred -u /etc/shadow').isDestructive).toBe(true);
    });

    it('blocks Windows rmdir /s /q targeting root drive', () => {
      expect(detectDestructiveDeletion('rmdir /s /q C:\\').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rmdir /s /q \\').isDestructive).toBe(true);
    });

    it('allows benign rm and safe scoped cleanups', () => {
      expect(detectDestructiveDeletion('rm test.txt').isDestructive).toBe(false);
      expect(detectDestructiveDeletion('rm -f output.log').isDestructive).toBe(false);
      expect(detectDestructiveDeletion('rm -rf ./build').isDestructive).toBe(false);
      expect(detectDestructiveDeletion('rm -rf /tmp/scratch_dir').isDestructive).toBe(false);
      expect(detectDestructiveDeletion('shred temp_test.key').isDestructive).toBe(false);
    });
  });

  describe('SentinelEngine Integration', () => {
    it('blocks tool execution when destructive deletion rule is registered in engine', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(createDestructiveDeletionRule());

      const res = await engine.evaluate({
        id: 'call-rm-root',
        toolName: 'shell:execute',
        category: 'shell',
        params: { cmd: 'sudo rm -rf /' },
        timestamp: Date.now(),
      });

      expect(res.verdict).toBe(Verdict.BLOCK);
      expect(res.allowed).toBe(false);
      expect(res.violations[0].ruleId).toBe('block-destructive-deletion');
      expect(res.violations[0].severity).toBe('critical');
    });

    it('permits safe shell commands to execute cleanly', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(createDestructiveDeletionRule());

      const res = await engine.evaluate({
        id: 'call-safe-cleanup',
        toolName: 'shell:execute',
        category: 'shell',
        params: { cmd: 'rm -rf ./coverage' },
        timestamp: Date.now(),
      });

      expect(res.verdict).toBe(Verdict.ALLOW);
      expect(res.allowed).toBe(true);
      expect(res.violations).toHaveLength(0);
    });
  });
});
