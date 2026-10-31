import { describe, it, expect } from 'vitest';
import { OperationTypeClassifier } from '../src/utils/operation_type_classifier.js';

describe('OperationTypeClassifier', () => {
  it('classifies payment operation as LOW risk', () => {
    const op = OperationTypeClassifier.classify('payment');
    expect(op.category).toBe('payment');
    expect(op.riskLevel).toBe('LOW');
  });

  it('classifies accountMerge as CRITICAL risk', () => {
    const op = OperationTypeClassifier.classify('accountMerge');
    expect(op.category).toBe('account');
    expect(op.riskLevel).toBe('CRITICAL');
    expect(OperationTypeClassifier.isHighRisk('accountMerge')).toBe(true);
  });

  it('classifies setOptions as HIGH risk', () => {
    const op = OperationTypeClassifier.classify('setOptions');
    expect(op.category).toBe('governance');
    expect(op.riskLevel).toBe('HIGH');
    expect(OperationTypeClassifier.isHighRisk('setOptions')).toBe(true);
  });

  it('classifies soroban contract invocation as HIGH risk', () => {
    const op = OperationTypeClassifier.classify('invokeHostFunction');
    expect(op.category).toBe('soroban');
    expect(op.riskLevel).toBe('HIGH');
  });
});
