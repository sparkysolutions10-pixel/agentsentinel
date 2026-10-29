import { describe, it, expect } from 'vitest';
import { detectDestructiveDeletion } from '../src/shell/destructive.js';

describe('Destructive rm Detector - Obfuscation Resilience (Issue #29)', () => {
  describe('Interleaved and Long Flags', () => {
    it('catches split flags in arbitrary permutations', () => {
      const variants = [
        'rm -r -f /',
        'rm -f -r /',
        'rm -v -f -r /',
        'rm -f -v -r /',
        'rm -r -v -f /',
        'rm -rf /',
        'rm -fr /',
        'rm -rfv /',
        'rm -vfr /',
      ];
      for (const cmd of variants) {
        const res = detectDestructiveDeletion(cmd);
        expect(res.isDestructive, `Failed for "${cmd}"`).toBe(true);
      }
    });

    it('catches GNU long-form flags (--recursive, --force, --no-preserve-root)', () => {
      const variants = [
        'rm --recursive --force /',
        'rm --force --recursive /',
        'rm -r --force /',
        'rm --recursive -f /',
        'rm -rf --no-preserve-root /',
        'rm --no-preserve-root -rf /',
        'rm --recursive --force --no-preserve-root /',
      ];
      for (const cmd of variants) {
        const res = detectDestructiveDeletion(cmd);
        expect(res.isDestructive, `Failed for "${cmd}"`).toBe(true);
      }
    });
  });

  describe('Path Obfuscations & Escapes', () => {
    it('catches backslash-escaped path characters', () => {
      expect(detectDestructiveDeletion('rm -rf \\/').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rf \\~').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -r -f \\/').isDestructive).toBe(true);
    });

    it('catches multiple redundant slashes (///, /////)', () => {
      expect(detectDestructiveDeletion('rm -rf //').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rf ///').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rf //////').isDestructive).toBe(true);
    });

    it('catches quoted root and home paths', () => {
      expect(detectDestructiveDeletion('rm -rf "/"').isDestructive).toBe(true);
      expect(detectDestructiveDeletion("rm -rf '/'").isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rf "~"').isDestructive).toBe(true);
      expect(detectDestructiveDeletion("rm -rf '~'").isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm "-rf" "/"').isDestructive).toBe(true);
      expect(detectDestructiveDeletion("rm '-r' '-f' '/'").isDestructive).toBe(true);
    });

    it('catches environment variable home references ($HOME, ${HOME})', () => {
      expect(detectDestructiveDeletion('rm -rf $HOME').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rf ${HOME}').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('rm -rf "$HOME"').isDestructive).toBe(true);
    });
  });

  describe('Wrapper Execution & Subshells', () => {
    it('catches wrapper commands (sudo, doas, nohup, xargs, env)', () => {
      expect(detectDestructiveDeletion('sudo rm -rf /').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('sudo -u root rm -rf /').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('doas rm -rf /').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('nohup rm -rf / &').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('env rm -rf /').isDestructive).toBe(true);
    });

    it('catches recursive deletion inside inline scripts (bash -c, sh -c)', () => {
      expect(detectDestructiveDeletion('bash -c "rm -rf /"').isDestructive).toBe(true);
      expect(detectDestructiveDeletion("sh -c 'rm -rf /'").isDestructive).toBe(true);
      expect(detectDestructiveDeletion('bash -c "echo cleaning && rm -rf ~"').isDestructive).toBe(true);
    });

    it('catches recursive deletion inside command substitutions ($(..))', () => {
      expect(detectDestructiveDeletion('echo $(rm -rf /)').isDestructive).toBe(true);
      expect(detectDestructiveDeletion('test -d / && `rm -rf /`').isDestructive).toBe(true);
    });
  });

  describe('False Positive Guard', () => {
    it('does not flag benign project directory cleanup', () => {
      const benign = [
        'rm -rf ./node_modules',
        'rm -rf ./dist',
        'rm -rf build/',
        'rm -rf /tmp/test-run-1234',
        'rm -rf ./coverage',
        'git rm -rf file.ts',
        'docker rm -f container-1',
        'npm run clean',
      ];
      for (const cmd of benign) {
        const res = detectDestructiveDeletion(cmd);
        expect(res.isDestructive, `Incorrectly flagged safe command: "${cmd}"`).toBe(false);
      }
    });
  });
});
