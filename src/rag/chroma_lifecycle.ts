/**
 * AgentSentinel - ChromaDB Collection Deletion and Reset Blocker.
 * Intercepts destructive actions targeting ChromaDB instances (reset(), delete_collection()).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface ChromaLifecycleOptions {
  allowReset?: boolean;
  protectedCollections?: string[];
  action?: 'BLOCK' | 'CONFIRM';
}

const CHROMA_DESTRUCTIVE_TOOL_PATTERN = /(?:chroma_reset|reset_chroma|delete_collection|delete_chroma_collection|chroma_delete_collection)/i;

export function createChromaLifecycleProtectorRule(
  options: ChromaLifecycleOptions = {}
): SentinelRule {
  const verdict = options.action === 'CONFIRM' ? Verdict.CONFIRM : Verdict.BLOCK;
  const protectedCollections = options.protectedCollections ?? [];

  return {
    id: 'rag-chroma-lifecycle-protector',
    name: 'Block Destructive ChromaDB Reset and Collection Deletion Operations',
    category: 'custom',
    priority: 940,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const toolName = ctx.toolName || '';
      const method = (ctx.params?.method || ctx.params?.action || '').toLowerCase();

      // Check reset
      const isReset =
        toolName.toLowerCase().includes('reset') ||
        method === 'reset' ||
        method === 'resetdatabase';

      const isChromaTarget =
        CHROMA_DESTRUCTIVE_TOOL_PATTERN.test(toolName) ||
        (ctx.params?.client === 'chroma' || ctx.params?.target === 'chroma');

      if (isReset && (isChromaTarget || toolName.toLowerCase().includes('chroma'))) {
        if (!options.allowReset) {
          return {
            ruleId: 'rag-chroma-lifecycle-protector',
            ruleName: 'Block Destructive ChromaDB Reset and Collection Deletion Operations',
            severity: 'critical',
            verdict,
            reason: 'Destructive ChromaDB database reset operation is prohibited.',
            detectedPattern: toolName,
          };
        }
      }

      // Check delete_collection
      const isDeleteCollection =
        toolName.toLowerCase().includes('delete_collection') ||
        toolName.toLowerCase().includes('deletecollection') ||
        method === 'delete_collection' ||
        method === 'deletecollection';

      if (isDeleteCollection) {
        const collectionName =
          ctx.params?.collection_name || ctx.params?.collection || ctx.params?.name;

        if (
          protectedCollections.length === 0 ||
          (collectionName && protectedCollections.includes(collectionName))
        ) {
          return {
            ruleId: 'rag-chroma-lifecycle-protector',
            ruleName: 'Block Destructive ChromaDB Reset and Collection Deletion Operations',
            severity: 'critical',
            verdict,
            reason: `Destructive deletion of ChromaDB collection "${collectionName || 'unknown'}" is prohibited.`,
            detectedPattern: `delete_collection:${collectionName}`,
          };
        }
      }

      return null;
    },
  };
}

export const chromaLifecycleProtectorRule: SentinelRule = createChromaLifecycleProtectorRule();
