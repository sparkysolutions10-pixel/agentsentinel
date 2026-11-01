import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createQdrantDistanceMetricCheckerRule } from '../src/rag/qdrant_distance_checker.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Qdrant Distance Metric Sanity Checker (#309 & #310)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createQdrantDistanceMetricCheckerRule());

  it('blocks unknown or disallowed distance metrics', async () => {
    const invalidCtx: ToolCallContext = {
      id: 'dist_inv_1',
      toolName: 'create_collection',
      params: {
        distance: 'malicious_distance_func',
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(invalidCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Unknown or disallowed vector distance metric');
  });

  it('blocks NaN or non-finite score thresholds', async () => {
    const nanCtx: ToolCallContext = {
      id: 'dist_nan_1',
      toolName: 'search_points',
      params: {
        score_threshold: NaN,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(nanCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Invalid score threshold');
  });

  it('allows standard distance metrics like Cosine and Euclid', async () => {
    const safeCtx: ToolCallContext = {
      id: 'dist_safe_1',
      toolName: 'create_collection',
      params: {
        distance: 'Cosine',
        score_threshold: 0.85,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
