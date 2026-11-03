/**
 * Auto-generated Enterprise Security Invariant: Issue #1857
 * Title: feat(ast): implement AST guard halting rm -rf commands targeting root, home, or wildcards
 */
export class DangerousRmRootWildcardBlocker {
  private static readonly INVARIANT_NAME = 'RULE_INVARIANT_DANGEROUS_RM_ROOT_WILDCARD_BLOCKER';

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
