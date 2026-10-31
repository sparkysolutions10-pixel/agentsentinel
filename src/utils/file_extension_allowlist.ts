import path from 'path';

/**
 * FileExtensionAllowlist - File extension validator with disguised double-extension detection.
 */

export class FileExtensionAllowlist {
  private allowedExtensions: Set<string>;

  constructor(allowedExtensions: string[]) {
    this.allowedExtensions = new Set(
      allowedExtensions.map(ext => (ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`))
    );
  }

  public isAllowed(filePath: string): boolean {
    if (!filePath || typeof filePath !== 'string') return false;
    const ext = path.extname(filePath).toLowerCase();
    return this.allowedExtensions.has(ext);
  }

  public hasDoubleExtension(filePath: string): boolean {
    if (!filePath || typeof filePath !== 'string') return false;
    const base = path.basename(filePath);
    const parts = base.split('.');
    return parts.length > 2 && parts[parts.length - 1].length > 0 && parts[parts.length - 2].length > 0;
  }

  public getAllowedExtensions(): string[] {
    return Array.from(this.allowedExtensions);
  }
}
