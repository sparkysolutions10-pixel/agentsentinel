export class EntropyObfuscationScrubber {
    static BASE64_CHUNK_REGEX = /\b[A-Za-z0-9+/]{40,}={0,2}\b/g;
    static scrub(input) {
        if (!input || typeof input !== 'string')
            return '';
        return input.replace(this.BASE64_CHUNK_REGEX, '[REDACTED_ENCODED_PAYLOAD]');
    }
    static hasObfuscatedBlobs(input) {
        if (!input || typeof input !== 'string')
            return false;
        return this.BASE64_CHUNK_REGEX.test(input);
    }
}
//# sourceMappingURL=entropy_obfuscation_scrubber.js.map