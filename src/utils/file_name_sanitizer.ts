export class FileNameSanitizer {
  private static readonly ILLEGAL_CHARS = /[/\\?%*:|"<>\x00-\x1f]/g;

  public static sanitize(filename: string, replacement: string = '_'): string {
    if (!filename || typeof filename !== 'string') return '';
    return filename.trim().replace(this.ILLEGAL_CHARS, replacement);
  }
}
