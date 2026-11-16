/**
 * AgentSentinel - Semver Parser Utility
 * Parses and compares semantic versions for tools, plugins, and dependencies.
 */
export interface SemverObject {
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
}
export declare class SemverParser {
    private static readonly REGEX;
    static parse(version: string): SemverObject | null;
    static compare(v1: string, v2: string): number;
    static satisfies(version: string, minVersion: string): boolean;
}
//# sourceMappingURL=semver_parser.d.ts.map