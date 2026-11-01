export class EntropyObfuscationScrubber {
  private static readonly BASE64_CHUNK_REGEX = /\b[A-Za-z0-9+/]{40,}={0,2}\b/g;

  public static scrub(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input.replace(this.BASE64_CHUNK_REGEX, '[REDACTED_ENCODED_PAYLOAD]');
  }

  public static hasObfuscatedBlobs(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    return this.BASE64_CHUNK_REGEX.test(input);
  }
}
