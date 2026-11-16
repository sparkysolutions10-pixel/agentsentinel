/**
 * FileExtensionAllowlist - File extension validator with disguised double-extension detection.
 */
export declare class FileExtensionAllowlist {
    private allowedExtensions;
    constructor(allowedExtensions: string[]);
    isAllowed(filePath: string): boolean;
    hasDoubleExtension(filePath: string): boolean;
    getAllowedExtensions(): string[];
}
//# sourceMappingURL=file_extension_allowlist.d.ts.map