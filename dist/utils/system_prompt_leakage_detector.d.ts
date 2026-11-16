/**
 * AgentSentinel - System Prompt Leakage Detector Utility
 * Inspects agent responses for system instruction leaks and canary token disclosures.
 */
export declare class SystemPromptLeakageDetector {
    private static readonly LEAK_PATTERNS;
    static containsLeakage(response: string, canaryTokens?: string[]): boolean;
}
//# sourceMappingURL=system_prompt_leakage_detector.d.ts.map