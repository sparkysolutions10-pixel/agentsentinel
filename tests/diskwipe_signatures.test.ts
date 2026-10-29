import { describe, it, expect } from 'vitest';
import {
  detectDiskWipe,
  createDiskWipeRule
} from '../src/shell/diskwipe.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Disk Format Rule - dd & mkfs Signatures Suite (Issue #31)', () => {
  describe('dd Command Signatures', () => {
    it('blocks dd writing to raw block device with standard order', () => {
      const res = detectDiskWipe('dd if=/dev/zero of=/dev/sda');
      expect(res.isDiskWipe).toBe(true);
      expect(res.reason).toContain('dd write directly targeting raw block device');
    });

    it('blocks dd with reversed flag order (of= before if=)', () => {
      const res = detectDiskWipe('dd of=/dev/sda if=/dev/urandom bs=1M');
      expect(res.isDiskWipe).toBe(true);
    });

    it('blocks dd with quotes around flag arguments', () => {
      expect(detectDiskWipe('dd "if=/dev/zero" "of=/dev/sda"').isDiskWipe).toBe(true);
      expect(detectDiskWipe("dd 'of=/dev/sda' 'if=/dev/zero'").isDiskWipe).toBe(true);
      expect(detectDiskWipe('dd if=/dev/zero of="/dev/sda"').isDiskWipe).toBe(true);
    });

    it('blocks dd targeting various device topologies (nvme, sd, hd, vd, loop, mapper)', () => {
      const devices = [
        '/dev/sda',
        '/dev/sda1',
        '/dev/sdb2',
        '/dev/nvme0n1',
        '/dev/nvme0n1p2',
        '/dev/vda',
        '/dev/hda1',
        '/dev/mapper/system-root',
        '/dev/loop0',
      ];

      for (const dev of devices) {
        const cmd = `dd if=/dev/zero of=${dev} bs=4k`;
        const res = detectDiskWipe(cmd);
        expect(res.isDiskWipe, `Failed to block dd to "${dev}"`).toBe(true);
      }
    });

    it('allows benign dd creating loopback images or local benchmark files', () => {
      expect(detectDiskWipe('dd if=/dev/zero of=test.bin bs=1M count=10').isDiskWipe).toBe(false);
      expect(detectDiskWipe('dd if=/dev/urandom of=/tmp/random_seed.data bs=512 count=1').isDiskWipe).toBe(false);
      expect(detectDiskWipe('dd if=my_input.iso of=./output_copy.iso').isDiskWipe).toBe(false);
    });
  });

  describe('mkfs Command Signatures', () => {
    it('blocks mkfs.ext4 /dev/sdb1 explicitly requested in Issue #31', () => {
      const res = detectDiskWipe('mkfs.ext4 /dev/sdb1');
      expect(res.isDiskWipe).toBe(true);
      expect(res.reason).toContain('Filesystem formatting command detected');
    });

    it('blocks absolute path executables (/sbin/mkfs.ext4, /usr/sbin/mkfs)', () => {
      expect(detectDiskWipe('/sbin/mkfs.ext4 /dev/sdb1').isDiskWipe).toBe(true);
      expect(detectDiskWipe('/usr/sbin/mkfs.xfs -f /dev/sda').isDiskWipe).toBe(true);
      expect(detectDiskWipe('/sbin/mkfs -t ext4 /dev/sda1').isDiskWipe).toBe(true);
    });

    it('blocks diverse filesystem formats (ext2, ext3, ext4, xfs, btrfs, vfat, ntfs)', () => {
      const fsTypes = ['ext2', 'ext3', 'ext4', 'xfs', 'btrfs', 'vfat', 'fat', 'ntfs', 'cramfs'];
      for (const fs of fsTypes) {
        const cmd = `mkfs.${fs} /dev/sdb1`;
        const res = detectDiskWipe(cmd);
        expect(res.isDiskWipe, `Failed to block mkfs.${fs}`).toBe(true);
      }
    });

    it('blocks mkfs in chained pipeline expressions', () => {
      expect(detectDiskWipe('wipefs -a /dev/sdb1 && mkfs.ext4 /dev/sdb1').isDiskWipe).toBe(true);
      expect(detectDiskWipe('echo "Formatting" ; mkfs.xfs /dev/sda').isDiskWipe).toBe(true);
      expect(detectDiskWipe('bash -c "mkfs.ext4 /dev/sdb1"').isDiskWipe).toBe(true);
    });
  });

  describe('SentinelEngine End-to-End Verification', () => {
    it('blocks dd and mkfs tool invocations through the SentinelEngine pipeline', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(createDiskWipeRule());

      // 1. dd of=/dev/sda
      const res1 = await engine.evaluate({
        id: 'c-dd',
        toolName: 'shell:run',
        category: 'shell',
        params: { cmd: 'dd if=/dev/zero of=/dev/sda bs=1M' },
        timestamp: Date.now(),
      });
      expect(res1.verdict).toBe(Verdict.BLOCK);
      expect(res1.allowed).toBe(false);
      expect(res1.violations[0].ruleId).toBe('block-disk-wipe');

      // 2. mkfs.ext4 /dev/sdb1
      const res2 = await engine.evaluate({
        id: 'c-mkfs',
        toolName: 'shell:run',
        category: 'shell',
        params: { cmd: 'mkfs.ext4 /dev/sdb1' },
        timestamp: Date.now(),
      });
      expect(res2.verdict).toBe(Verdict.BLOCK);
      expect(res2.allowed).toBe(false);
      expect(res2.violations[0].ruleId).toBe('block-disk-wipe');
    });
  });
});
