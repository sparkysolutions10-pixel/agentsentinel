/**
 * Auto-generated Enterprise Security Invariant: Issue #1885
 * Title: feat(ast): implement Ruby AST analyzer preventing unescaped backtick command execution
 */
export declare class RubySystemBacktickInjection {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=ruby_system_backtick_injection.d.ts.map