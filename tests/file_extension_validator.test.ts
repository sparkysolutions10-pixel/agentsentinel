import { describe, it, expect } from 'vitest';
import { FileExtensionValidator } from '../src/utils/file_extension_validator.js';

describe('FileExtensionValidator', () => {
  it('checks filename extensions against allowlist', () => {
    expect(FileExtensionValidator.isAllowed('doc.pdf', ['pdf', 'docx'])).toBe(true);
    expect(FileExtensionValidator.isAllowed('script.sh', ['pdf', 'docx'])).toBe(false);
  });
});
