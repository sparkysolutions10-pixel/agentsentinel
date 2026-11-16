export class DirectoryListingFilter {
    static filterHidden(files) {
        if (!Array.isArray(files))
            return [];
        return files.filter(f => !f.startsWith('.'));
    }
}
//# sourceMappingURL=directory_listing_filter.js.map