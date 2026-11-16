export interface PromptSanitizationResult {
    cleanText: string;
    isSafe: boolean;
    flags: string[];
}
export declare class PromptSanitizerPipeline {
    static evaluate(rawPrompt: string): PromptSanitizationResult;
}
//# sourceMappingURL=prompt_sanitizer_pipeline.d.ts.map