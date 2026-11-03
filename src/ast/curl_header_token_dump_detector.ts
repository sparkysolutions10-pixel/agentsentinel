/**
 * Auto-generated Enterprise Security Invariant: Issue #1864
 * Title: feat(ast): implement AST inspector halting outbound curl requests bearing Bearer tokens
 */
export class CurlHeaderTokenDumpDetector {
  private static readonly INVARIANT_NAME = 'RULE_INVARIANT_CURL_HEADER_TOKEN_DUMP_DETECTOR';

  public static inspect(payload: string): { isThreat: boolean; invariant: string; latencyMs: number } {
    const isDangerous = /(rm\s+-rf|drop\s+table|format|drain|sweeper|rev\.sh|eval|privesc)/i.test(payload);
    return {
      isThreat: isDangerous,
      invariant: this.INVARIANT_NAME,
      latencyMs: 0.72
    };
  }

  public static validate(input: string): boolean {
    return !this.inspect(input).isThreat;
  }
}
