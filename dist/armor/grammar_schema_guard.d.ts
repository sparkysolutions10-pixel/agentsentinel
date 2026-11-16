import { SentinelRule } from '../types.js';
export interface GrammarSchemaConfig {
    disallowedProperties?: string[];
    maxProperties?: number;
}
export declare function createGrammarSchemaGuardRule(config?: GrammarSchemaConfig): SentinelRule;
//# sourceMappingURL=grammar_schema_guard.d.ts.map