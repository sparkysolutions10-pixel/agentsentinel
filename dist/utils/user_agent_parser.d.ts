/**
 * AgentSentinel - User Agent Parser Utility
 * Inspects HTTP User-Agent strings to identify tools and detect hostile automated scanners.
 */
export interface UserAgentInfo {
    raw: string;
    isBot: boolean;
    isScanner: boolean;
}
export declare class UserAgentParser {
    private static readonly SCANNER_PATTERNS;
    private static readonly BOT_PATTERNS;
    static parse(userAgent: string): UserAgentInfo;
}
//# sourceMappingURL=user_agent_parser.d.ts.map