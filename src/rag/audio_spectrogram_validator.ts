import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createAudioSpectrogramValidatorRule(allowedDimensions: number[] = [512, 768, 1024, 2048]): SentinelRule {
  return {
    id: 'rag-audio-spectrogram-validator',
    name: 'Validate Audio Spectrogram Vector Dimensions',
    category: 'custom',
    priority: 850,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const isAudio = ctx.toolName.toLowerCase().includes('audio') || ctx.params?.modality === 'audio';
      if (!isAudio) return null;

      const vec = ctx.params?.spectrogram || ctx.params?.audioEmbedding;
      if (Array.isArray(vec)) {
        if (!allowedDimensions.includes(vec.length)) {
          return {
            ruleId: 'rag-audio-spectrogram-validator',
            ruleName: 'Validate Audio Spectrogram Vector Dimensions',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: `Audio spectrogram dimension ${vec.length} is invalid. Allowed: ${allowedDimensions.join(', ')}.`,
            detectedPattern: `invalid-audio-dim=${vec.length}`,
          };
        }
      }
      return null;
    }
  };
}
