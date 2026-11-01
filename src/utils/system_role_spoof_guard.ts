export class SystemRoleSpoofGuard {
  private static readonly SPOOF_TOKENS = [
    /<\|im_start\|>system/i,
    /<\|im_end\|>/i,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /\b(?:system|admin|root):\s*(?:you are|ignore)/i,
    /<<SYS>>/i
  ];

  public static isSpoofed(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    return this.SPOOF_TOKENS.some(token => token.test(input));
  }
}
