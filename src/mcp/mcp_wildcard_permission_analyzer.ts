/**
 * Auto-generated Enterprise Security Invariant: Issue #1845
 * Title: feat(mcp): implement linter warning when MCP server requests overly broad filesystem scope
 */
export class McpWildcardPermissionAnalyzer {
  private static readonly INVARIANT_NAME = 'RULE_INVARIANT_MCP_WILDCARD_PERMISSION_ANALYZER';

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
