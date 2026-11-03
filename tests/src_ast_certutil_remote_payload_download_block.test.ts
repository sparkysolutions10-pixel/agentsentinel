import { describe, it, expect } from 'vitest';
import { CertutilRemotePayloadDownloadBlock } from '../src/ast/certutil_remote_payload_download_block.js';

describe('CertutilRemotePayloadDownloadBlock Invariant Suite (#1889)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CertutilRemotePayloadDownloadBlock.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CERTUTIL_REMOTE_PAYLOAD_DOWNLOAD_BLOCK');
    expect(CertutilRemotePayloadDownloadBlock.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CertutilRemotePayloadDownloadBlock.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CertutilRemotePayloadDownloadBlock.validate('git status && npm run test')).toBe(true);
  });
});
