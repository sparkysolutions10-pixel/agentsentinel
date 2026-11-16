/**
 * OwaspTop10Mapper - OWASP Web and LLM Top 10 taxonomy mapper.
 */
export class OwaspTop10Mapper {
    static MAPPINGS = {
        prompt_injection: {
            owaspId: 'LLM01',
            category: 'Prompt Injection',
            type: 'llm'
        },
        sensitive_data_leakage: {
            owaspId: 'LLM02',
            category: 'Sensitive Information Disclosure',
            type: 'llm'
        },
        excessive_agency: {
            owaspId: 'LLM08',
            category: 'Excessive Agency',
            type: 'llm'
        },
        sql_injection: {
            owaspId: 'A03:2021',
            category: 'Injection',
            type: 'web'
        },
        broken_access_control: {
            owaspId: 'A01:2021',
            category: 'Broken Access Control',
            type: 'web'
        }
    };
    static getMapping(eventType) {
        return this.MAPPINGS[eventType] ?? null;
    }
}
//# sourceMappingURL=owasp_top10_mapper.js.map