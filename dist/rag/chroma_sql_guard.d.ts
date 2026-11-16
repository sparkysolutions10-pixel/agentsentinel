/**
 * AgentSentinel - ChromaDB SQL & Metadata Filter Injection Guard Rule.
 * Detects and blocks raw SQL injection patterns inside ChromaDB's underlying SQLite/DuckDB persistence metadata filters.
 */
import { SentinelRule } from '../types.js';
export interface ChromaSqlInjectionGuardOptions {
    blockedKeywords?: string[];
}
export declare function inspectChromaMetadataFilters(params: Record<string, any>): {
    isValid: boolean;
    violationReason?: string;
    detectedPattern?: string;
};
export declare function createChromaSqlInjectionGuardRule(options?: ChromaSqlInjectionGuardOptions): SentinelRule;
export declare const chromaSqlInjectionGuardRule: SentinelRule;
//# sourceMappingURL=chroma_sql_guard.d.ts.map