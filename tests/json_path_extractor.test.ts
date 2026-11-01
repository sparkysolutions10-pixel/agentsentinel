import { describe, it, expect } from 'vitest';
import { JsonPathExtractor } from '../src/utils/json_path_extractor.js';

describe('JsonPathExtractor', () => {
  const data = {
    agent: {
      id: 'sentinel-01',
      metrics: {
        uptime: 99.9,
        tags: ['security', 'soroban', 'enterprise']
      }
    }
  };

  it('extracts deeply nested properties', () => {
    expect(JsonPathExtractor.get(data, 'agent.id')).toBe('sentinel-01');
    expect(JsonPathExtractor.get(data, 'agent.metrics.uptime')).toBe(99.9);
  });

  it('extracts array elements using bracket notation', () => {
    expect(JsonPathExtractor.get(data, 'agent.metrics.tags[1]')).toBe('soroban');
    expect(JsonPathExtractor.get(data, 'agent.metrics.tags[0]')).toBe('security');
  });

  it('returns default value for missing keys', () => {
    expect(JsonPathExtractor.get(data, 'agent.nonexistent', 'default-val')).toBe('default-val');
    expect(JsonPathExtractor.get(null, 'any.path', 42)).toBe(42);
  });

  it('checks key existence correctly', () => {
    expect(JsonPathExtractor.has(data, 'agent.metrics.uptime')).toBe(true);
    expect(JsonPathExtractor.has(data, 'agent.metrics.nonexistent')).toBe(false);
  });
});
