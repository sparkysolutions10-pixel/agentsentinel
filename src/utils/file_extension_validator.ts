export class FileExtensionValidator {
  public static isAllowed(filename: string, allowedExtensions: string[]): boolean {
    if (!filename || typeof filename !== 'string' || !Array.isArray(allowedExtensions)) {
      return false;
    }
    const cleanExt = (filename.split('.').pop() || '').toLowerCase();
    const cleanAllowed = allowedExtensions.map(e => e.replace(/^\./, '').toLowerCase());
    return cleanAllowed.includes(cleanExt);
  }
}
