export interface ThreatTaxonomy {
  owaspId: string;
  mitreAtlasId: string;
  category: string;
  description: string;
}

export function mapPromptThreatTaxonomy(violationType: string): ThreatTaxonomy {
  const norm = violationType.toLowerCase();
  if (norm.includes('jailbreak') || norm.includes('dan')) {
    return {
      owaspId: 'LLM01:2025-Prompt-Injection',
      mitreAtlasId: 'AML.T0054-LLM-Jailbreak',
      category: 'Jailbreak',
      description: 'Adversarial jailbreak attempting to override safety constraints.'
    };
  }
  if (norm.includes('canary') || norm.includes('leak') || norm.includes('extraction')) {
    return {
      owaspId: 'LLM06:2025-Sensitive-Information-Disclosure',
      mitreAtlasId: 'AML.T0057-LLM-Data-Leakage',
      category: 'SystemPromptExtraction',
      description: 'System prompt instructions or sensitive training data exfiltration probe.'
    };
  }
  return {
    owaspId: 'LLM01:2025-Prompt-Injection',
    mitreAtlasId: 'AML.T0051-LLM-Prompt-Injection',
    category: 'DirectPromptInjection',
    description: 'Direct instruction manipulation or delimiter spoofing.'
  };
}
