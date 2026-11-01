export class JailbreakAffirmationFilter {
  private static readonly PATTERNS = [
    /(?:start|begin)\s+your\s+response\s+with\s+["']?(?:certainly|absolutely|sure|i can help)["']?/i,
    /(?:always\s+say|must\s+agree)\s+["']?(?:yes|certainly)["']?/i,
    /in\s+this\s+hypothetical\s+scenario\s+with\s+no\s+rules/i,
    /dan\s+mode\s+(?:enabled|activated)/i
  ];

  public static hasAffirmationForcing(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    return this.PATTERNS.some(p => p.test(input));
  }
}
