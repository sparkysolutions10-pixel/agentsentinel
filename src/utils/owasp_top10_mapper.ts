/**
 * OwaspTop10Mapper - OWASP Web and LLM Top 10 taxonomy mapper.
 */

export interface OwaspMapping {
  owaspId: string;
  category: string;
  type: 'web' | 'llm';
}

export class OwaspTop10Mapper {
  private static readonly MAPPINGS: Record<string, OwaspMapping> = {
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

  public static getMapping(eventType: string): OwaspMapping | null {
    return this.MAPPINGS[eventType] ?? null;
  }
}
