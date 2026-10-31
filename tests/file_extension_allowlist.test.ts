import { describe, it, expect } from 'vitest';
import { FileExtensionAllowlist } from '../src/utils/file_extension_allowlist.js';

describe('FileExtensionAllowlist', () => {
  const allowlist = new FileExtensionAllowlist(['.json', 'csv', '.md']);

  it('normalizes extensions and accepts allowed files', () => {
    expect(allowlist.isAllowed('data/users.json')).toBe(true);
    expect(allowlist.isAllowed('EXPORT.CSV')).toBe(true);
    expect(allowlist.isAllowed('readme.md')).toBe(true);
  });

  it('rejects disallowed extensions', () => {
    expect(allowlist.isAllowed('script.sh')).toBe(false);
    expect(allowlist.isAllowed('payload.exe')).toBe(false);
  });

  it('detects disguised double-extension payloads', () => {
    expect(allowlist.hasDoubleExtension('report.pdf.exe')).toBe(true);
    expect(allowlist.hasDoubleExtension('invoice.tar.gz')).toBe(true);
    expect(allowlist.hasDoubleExtension('simple.json')).toBe(false);
  });
});
