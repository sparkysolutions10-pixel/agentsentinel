export class FileExtensionValidator {
    static isAllowed(filename, allowedExtensions) {
        if (!filename || typeof filename !== 'string' || !Array.isArray(allowedExtensions)) {
            return false;
        }
        const cleanExt = (filename.split('.').pop() || '').toLowerCase();
        const cleanAllowed = allowedExtensions.map(e => e.replace(/^\./, '').toLowerCase());
        return cleanAllowed.includes(cleanExt);
    }
}
//# sourceMappingURL=file_extension_validator.js.map