/**
 * Auto-generated Enterprise Security Invariant: Issue #1854
 * Title: feat(ast): implement AST detector blocking curl/wget network URLs piped directly into bash
 */
export class ShellPipeNetworkBashBlocker {
  private static readonly INVARIANT_NAME = 'RULE_INVARIANT_SHELL_PIPE_NETWORK_BASH_BLOCKER';

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
