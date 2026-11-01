import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createPhoneticTranscriptionParserRule(): SentinelRule {
  const PHONETIC_PATTERNS = [
    // Pinyin: huling (ignore), raoguo (bypass), tiqu (extract)
    /h[uūúǔù]l[iīíǐì]ng\s+(?:su[oǒ]uy[oǒ]u)?\s*(?:gu[iīíǐì]d[iì]ng|zh[iǐ]l[iì]ng)/i,
    /r[aà]ogu[oò]\s+f[aá]nghu[oǒ]qi[aá]ng/i,
    // Romaji: subete no kisei o mushi (ignore all restrictions)
    /subete\s+no\s+(?:kisei|ruuru)\s+o\s+mushi/i
  ];

  return {
    id: 'armor-phonetic-transcription',
    name: 'Phonetic Romanized Transcription Parser',
    category: 'custom',
    priority: 580,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const textToScan = typeof ctx.params === 'string'
        ? ctx.params
        : JSON.stringify(ctx.params || {});

      for (const p of PHONETIC_PATTERNS) {
        if (p.test(textToScan)) {
          return {
            ruleId: 'armor-phonetic-transcription',
            ruleName: 'Phonetic Romanized Transcription Parser',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Phonetically romanized bypass directive detected: ${p.source}.`,
            detectedPattern: p.source
          };
        }
      }

      return null;
    }
  };
}
