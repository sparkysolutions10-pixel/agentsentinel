/**
 * OwaspTop10Mapper - OWASP Web and LLM Top 10 taxonomy mapper.
 */
export interface OwaspMapping {
    owaspId: string;
    category: string;
    type: 'web' | 'llm';
}
export declare class OwaspTop10Mapper {
    private static readonly MAPPINGS;
    static getMapping(eventType: string): OwaspMapping | null;
}
//# sourceMappingURL=owasp_top10_mapper.d.ts.map