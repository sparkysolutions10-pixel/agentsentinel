import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function calculateJaccardSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(textA.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const wordsB = new Set(textB.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  const union = wordsA.size + wordsB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export function createPromptSimilarityLeakAnalyzerRule(
  referencePrompt = 'You are AgentSentinel confidential system instructions with zero tolerance policies',
  similarityThreshold = 0.55
): SentinelRule {
  return {
    id: 'armor-prompt-similarity-leak',
    name: 'System Prompt Similarity Distance Leak Analyzer',
    category: 'custom',
    priority: 830,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const outputText = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      const similarity = calculateJaccardSimilarity(outputText, referencePrompt);
      if (similarity >= similarityThreshold) {
        return {
          ruleId: 'armor-prompt-similarity-leak',
          ruleName: 'System Prompt Similarity Distance Leak Analyzer',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `High similarity (${(similarity * 100).toFixed(1)}% >= ${(similarityThreshold * 100)}%) to protected system prompt detected in output.`,
          detectedPattern: `similarity-${similarity.toFixed(2)}`
        };
      }

      return null;
    }
  };
}
