export class MimeTypeResolver {
    static MIME_MAP = {
        json: 'application/json',
        csv: 'text/csv',
        txt: 'text/plain',
        wasm: 'application/wasm',
        png: 'image/png',
        jpg: 'image/jpeg',
        pdf: 'application/pdf',
        html: 'text/html'
    };
    static resolve(filenameOrExt) {
        if (!filenameOrExt || typeof filenameOrExt !== 'string')
            return 'application/octet-stream';
        const ext = filenameOrExt.split('.').pop()?.toLowerCase() || '';
        return this.MIME_MAP[ext] || 'application/octet-stream';
    }
}
//# sourceMappingURL=mime_type_resolver.js.map