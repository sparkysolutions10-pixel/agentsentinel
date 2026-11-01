import { describe, it, expect } from 'vitest';
import { TemporaryFileCleaner } from '../src/utils/temporary_file_cleaner.js';

describe('TemporaryFileCleaner', () => {
  it('tracks temporary files for cleanup', () => {
    const cleaner = new TemporaryFileCleaner();
    cleaner.register('/tmp/file1.tmp');
    cleaner.register('/tmp/file2.tmp');
    expect(cleaner.getPendingFiles()).toEqual(['/tmp/file1.tmp', '/tmp/file2.tmp']);
    cleaner.unregister('/tmp/file1.tmp');
    expect(cleaner.getPendingFiles()).toEqual(['/tmp/file2.tmp']);
  });
});
