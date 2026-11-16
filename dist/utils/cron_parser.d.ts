/**
 * AgentSentinel - Cron Expression Parser Utility
 * Validates standard 5-part cron expressions and checks timestamp matches.
 */
export declare class CronParser {
    static isValid(cron: string): boolean;
    private static fieldValid;
    static matches(cron: string, date: Date): boolean;
    private static matchField;
}
//# sourceMappingURL=cron_parser.d.ts.map