export class FileNameSanitizer {
    static ILLEGAL_CHARS = /[/\\?%*:|"<>\x00-\x1f]/g;
    static sanitize(filename, replacement = '_') {
        if (!filename || typeof filename !== 'string')
            return '';
        return filename.trim().replace(this.ILLEGAL_CHARS, replacement);
    }
}
//# sourceMappingURL=file_name_sanitizer.js.map