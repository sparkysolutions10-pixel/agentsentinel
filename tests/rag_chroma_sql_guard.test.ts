import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import {
  createChromaSqlInjectionGuardRule,
  inspectChromaMetadataFilters,
} from '../src/rag/chroma_sql_guard.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('ChromaDB SQL Guard (#297 & #298)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createChromaSqlInjectionGuardRule());

  it('blocks metadata filters containing SQL tautology comment injection', async () => {
    const maliciousCtx: ToolCallContext = {
      id: 'chroma_sql_1',
      toolName: 'chroma_query',
      params: {
        where: {
          author: "' OR 1=1 --",
        },
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(maliciousCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].ruleId).toBe('rag-chroma-sql-injection-guard');
  });

  it('blocks metadata filters containing UNION SELECT injection', async () => {
    const maliciousCtx: ToolCallContext = {
      id: 'chroma_sql_2',
      toolName: 'chroma_query_collection',
      params: {
        where_document: {
          $contains: "test' UNION SELECT * FROM sqlite_master; --",
        },
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(maliciousCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('SQL injection pattern detected');
  });

  it('allows clean boolean metadata filters', async () => {
    const cleanCtx: ToolCallContext = {
      id: 'chroma_clean_1',
      toolName: 'chroma_query',
      params: {
        where: {
          genre: { $eq: 'sci-fi' },
          year: { $gt: 2020 },
        },
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(cleanCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });

  it('inspectChromaMetadataFilters returns valid for clean parameters', () => {
    const inspection = inspectChromaMetadataFilters({
      where: { category: 'machine-learning' },
    });
    expect(inspection.isValid).toBe(true);
  });
});
