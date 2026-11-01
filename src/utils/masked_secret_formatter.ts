export class MaskedSecretFormatter {
  public static mask(secret: string, visiblePrefixLen: number = 4, visibleSuffixLen: number = 4): string {
    if (!secret || typeof secret !== 'string') return '';
    const clean = secret.trim();
    if (clean.length <= visiblePrefixLen + visibleSuffixLen) {
      return '*'.repeat(clean.length);
    }

    const prefix = clean.substring(0, visiblePrefixLen);
    const suffix = clean.substring(clean.length - visibleSuffixLen);
    const maskedLen = Math.max(4, clean.length - (visiblePrefixLen + visibleSuffixLen));
    return `${prefix}${'*'.repeat(maskedLen)}${suffix}`;
  }
}
