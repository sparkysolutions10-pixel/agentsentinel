import path from 'path';
/**
 * FileExtensionAllowlist - File extension validator with disguised double-extension detection.
 */
export class FileExtensionAllowlist {
    allowedExtensions;
    constructor(allowedExtensions) {
        this.allowedExtensions = new Set(allowedExtensions.map(ext => (ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`)));
    }
    isAllowed(filePath) {
        if (!filePath || typeof filePath !== 'string')
            return false;
        const ext = path.extname(filePath).toLowerCase();
        return this.allowedExtensions.has(ext);
    }
    hasDoubleExtension(filePath) {
        if (!filePath || typeof filePath !== 'string')
            return false;
        const base = path.basename(filePath);
        const parts = base.split('.');
        return parts.length > 2 && parts[parts.length - 1].length > 0 && parts[parts.length - 2].length > 0;
    }
    getAllowedExtensions() {
        return Array.from(this.allowedExtensions);
    }
}
//# sourceMappingURL=file_extension_allowlist.js.map