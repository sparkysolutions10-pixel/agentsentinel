import { describe, it, expect } from 'vitest';
import { ZipSlipDetector } from '../src/utils/zip_slip_detector.js';

describe('ZipSlipDetector', () => {
  const destDir = '/var/www/uploads';

  it('approves safe nested extraction paths', () => {
    expect(ZipSlipDetector.isSafeExtractionPath(destDir, 'images/photo.png')).toBe(true);
    expect(ZipSlipDetector.isSafeExtractionPath(destDir, 'doc.txt')).toBe(true);
  });

  it('blocks Zip Slip directory traversal attacks', () => {
    expect(ZipSlipDetector.isSafeExtractionPath(destDir, '../../etc/passwd')).toBe(false);
    expect(ZipSlipDetector.isSafeExtractionPath(destDir, '../../../bin/sh')).toBe(false);
  });

  it('sanitizes malicious traversal entry paths', () => {
    expect(ZipSlipDetector.sanitizeEntryPath('../../etc/passwd')).toBe('etc/passwd');
  });
});
