export class TemporaryFileCleaner {
  private files: Set<string> = new Set();

  public register(filePath: string): void {
    if (filePath) this.files.add(filePath);
  }

  public unregister(filePath: string): void {
    this.files.delete(filePath);
  }

  public getPendingFiles(): string[] {
    return Array.from(this.files);
  }
}
