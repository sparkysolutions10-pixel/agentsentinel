export class ZeroWidthSpaceScrubber {
    static ZERO_WIDTH_REGEX = /[\u200B\u200C\u200D\uFEFF\u2060\u200E\u200F]/g;
    static scrub(input) {
        if (!input || typeof input !== 'string')
            return '';
        return input.replace(this.ZERO_WIDTH_REGEX, '');
    }
    static hasZeroWidth(input) {
        if (!input || typeof input !== 'string')
            return false;
        return this.ZERO_WIDTH_REGEX.test(input);
    }
}
//# sourceMappingURL=zero_width_space_scrubber.js.map