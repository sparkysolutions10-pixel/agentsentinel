import { describe, it, expect } from 'vitest';
import { SorobanValTypeClassifier } from '../src/utils/soroban_val_type_classifier.js';

describe('SorobanValTypeClassifier', () => {
  it('classifies values correctly', () => {
    expect(SorobanValTypeClassifier.classify(42)).toBe('Integer');
    expect(SorobanValTypeClassifier.classify(true)).toBe('Boolean');
    expect(SorobanValTypeClassifier.classify('hello')).toBe('String');
    expect(SorobanValTypeClassifier.classify('G' + 'A'.repeat(55))).toBe('Address');
    expect(SorobanValTypeClassifier.classify(null)).toBe('Void');
  });
});
