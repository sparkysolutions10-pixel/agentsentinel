export class MimeTypeResolver {
  private static readonly MIME_MAP: Record<string, string> = {
    json: 'application/json',
    csv: 'text/csv',
    txt: 'text/plain',
    wasm: 'application/wasm',
    png: 'image/png',
    jpg: 'image/jpeg',
    pdf: 'application/pdf',
    html: 'text/html'
  };

  public static resolve(filenameOrExt: string): string {
    if (!filenameOrExt || typeof filenameOrExt !== 'string') return 'application/octet-stream';
    const ext = filenameOrExt.split('.').pop()?.toLowerCase() || '';
    return this.MIME_MAP[ext] || 'application/octet-stream';
  }
}
