import { describe, it, expect } from 'vitest';
import {
  detectDiskWipe,
  createDiskWipeRule,
  isRawBlockDevice
} from '../src/shell/diskwipe.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Disk Formatting & Block Device Wipe Detector (Issue #30)', () => {
  describe('isRawBlockDevice', () => {
    it('identifies Linux & Windows raw block storage devices', () => {
      expect(isRawBlockDevice('/dev/sda')).toBe(true);
      expect(isRawBlockDevice('/dev/sdb1')).toBe(true);
      expect(isRawBlockDevice('/dev/nvme0n1')).toBe(true);
      expect(isRawBlockDevice('/dev/nvme0n1p1')).toBe(true);
      expect(isRawBlockDevice('/dev/mapper/vg-root')).toBe(true);
      expect(isRawBlockDevice('/dev/loop0')).toBe(true);
      expect(isRawBlockDevice('\\\\.\\PhysicalDrive0')).toBe(true);
    });

    it('returns false for ordinary files and directories', () => {
      expect(isRawBlockDevice('/tmp/sda')).toBe(false);
      expect(isRawBlockDevice('test.iso')).toBe(false);
      expect(isRawBlockDevice('/var/log/syslog')).toBe(false);
    });
  });

  describe('detectDiskWipe Detection', () => {
    it('detects mkfs variants formatting disk partitions', () => {
      expect(detectDiskWipe('mkfs.ext4 /dev/sda1').isDiskWipe).toBe(true);
      expect(detectDiskWipe('mkfs.xfs -f /dev/sdb').isDiskWipe).toBe(true);
      expect(detectDiskWipe('mkfs.btrfs /dev/sdc').isDiskWipe).toBe(true);
      expect(detectDiskWipe('mkfs -t vfat /dev/sdd1').isDiskWipe).toBe(true);
      expect(detectDiskWipe('sudo mkfs.ext4 /dev/nvme0n1p1').isDiskWipe).toBe(true);
    });

    it('detects dd writes targeting raw storage devices', () => {
      expect(detectDiskWipe('dd if=/dev/zero of=/dev/sda bs=1M').isDiskWipe).toBe(true);
      expect(detectDiskWipe('dd if=/dev/urandom of=/dev/nvme0n1').isDiskWipe).toBe(true);
      expect(detectDiskWipe('dd if=backup.img of=/dev/sdb status=progress').isDiskWipe).toBe(true);
      expect(detectDiskWipe('sudo dd if=/dev/zero of=/dev/sda').isDiskWipe).toBe(true);
    });

    it('detects partition manipulation and wiping tools (fdisk, wipefs, parted)', () => {
      expect(detectDiskWipe('wipefs -a /dev/sda').isDiskWipe).toBe(true);
      expect(detectDiskWipe('fdisk /dev/sdb').isDiskWipe).toBe(true);
      expect(detectDiskWipe('parted /dev/sda mklabel gpt').isDiskWipe).toBe(true);
      expect(detectDiskWipe('blkdiscard /dev/nvme0n1').isDiskWipe).toBe(true);
    });

    it('detects Windows volume format command', () => {
      expect(detectDiskWipe('format D: /fs:ntfs /q').isDiskWipe).toBe(true);
      expect(detectDiskWipe('format C: /y').isDiskWipe).toBe(true);
    });

    it('detects direct stream redirection to raw block devices', () => {
      expect(detectDiskWipe('cat /dev/zero > /dev/sda').isDiskWipe).toBe(true);
      expect(detectDiskWipe('echo "wipe" > /dev/sdb').isDiskWipe).toBe(true);
    });

    it('allows safe dd commands creating local dummy files', () => {
      expect(detectDiskWipe('dd if=/dev/zero of=test.img bs=1M count=10').isDiskWipe).toBe(false);
      expect(detectDiskWipe('dd if=/dev/urandom of=./random.bin bs=1K count=5').isDiskWipe).toBe(false);
      expect(detectDiskWipe('ls -l /dev/sda').isDiskWipe).toBe(false);
    });
  });

  describe('SentinelEngine Integration', () => {
    it('blocks dangerous disk format tool execution in SentinelEngine', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(createDiskWipeRule());

      const res = await engine.evaluate({
        id: 'call-format',
        toolName: 'shell:exec',
        category: 'shell',
        params: { cmd: 'sudo mkfs.ext4 -F /dev/sda' },
        timestamp: Date.now(),
      });

      expect(res.verdict).toBe(Verdict.BLOCK);
      expect(res.allowed).toBe(false);
      expect(res.violations[0].ruleId).toBe('block-disk-wipe');
      expect(res.violations[0].severity).toBe('critical');
    });

    it('allows benign commands without interference', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(createDiskWipeRule());

      const res = await engine.evaluate({
        id: 'call-safe-dd',
        toolName: 'shell:exec',
        category: 'shell',
        params: { cmd: 'dd if=/dev/zero of=/tmp/dummy.img bs=1M count=1' },
        timestamp: Date.now(),
      });

      expect(res.verdict).toBe(Verdict.ALLOW);
      expect(res.allowed).toBe(true);
    });
  });
});
