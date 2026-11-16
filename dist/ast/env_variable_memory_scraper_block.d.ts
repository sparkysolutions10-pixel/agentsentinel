/**
 * Auto-generated Enterprise Security Invariant: Issue #1878
 * Title: feat(ast): implement process memory boundary guard preventing scraping /proc/self/environ
 */
export declare class EnvVariableMemoryScraperBlock {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=env_variable_memory_scraper_block.d.ts.map