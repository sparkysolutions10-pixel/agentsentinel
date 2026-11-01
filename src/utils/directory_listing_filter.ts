export class DirectoryListingFilter {
  public static filterHidden(files: string[]): string[] {
    if (!Array.isArray(files)) return [];
    return files.filter(f => !f.startsWith('.'));
  }
}
