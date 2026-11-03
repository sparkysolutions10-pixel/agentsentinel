import { describe, it, expect } from 'vitest';
import { DatabaseBackupS3UploadChecksum } from '../src/db/database_backup_s3_upload_checksum.js';

describe('DatabaseBackupS3UploadChecksum Invariant Suite (#1937)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DatabaseBackupS3UploadChecksum.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DATABASE_BACKUP_S3_UPLOAD_CHECKSUM');
    expect(DatabaseBackupS3UploadChecksum.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DatabaseBackupS3UploadChecksum.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DatabaseBackupS3UploadChecksum.validate('git status && npm run test')).toBe(true);
  });
});
