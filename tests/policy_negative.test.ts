import { describe, it, expect } from 'vitest';
import { validatePolicyConfig } from '../src/policy.js';

describe('Declarative Policy Schema Negative Tests (Issue #9)', () => {
  it('throws TypeError when configuration is not a plain object', () => {
    expect(() => validatePolicyConfig(null)).toThrow(TypeError);
    expect(() => validatePolicyConfig(undefined)).toThrow(TypeError);
    expect(() => validatePolicyConfig('version: 1.0')).toThrow(TypeError);
    expect(() => validatePolicyConfig([])).toThrow(TypeError);
    expect(() => validatePolicyConfig(123)).toThrow(TypeError);
  });

  it('throws TypeError when version string is missing or whitespace', () => {
    expect(() => validatePolicyConfig({ rules: [] })).toThrow(/version/);
    expect(() => validatePolicyConfig({ version: '', rules: [] })).toThrow(/version/);
    expect(() => validatePolicyConfig({ version: '   ', rules: [] })).toThrow(/version/);
    expect(() => validatePolicyConfig({ version: 1.0, rules: [] })).toThrow(/version/);
  });

  it('throws TypeError when rules is not an array', () => {
    expect(() => validatePolicyConfig({ version: '1.0' })).toThrow(/rules/);
    expect(() => validatePolicyConfig({ version: '1.0', rules: null })).toThrow(/rules/);
    expect(() => validatePolicyConfig({ version: '1.0', rules: {} })).toThrow(/rules/);
  });

  it('throws TypeError when a rule in the array is invalid or missing required fields', () => {
    const baseRule = {
      id: 'valid-id',
      name: 'Valid Name',
      priority: 10,
      action: { verdict: 'BLOCK', reason: 'Denied' }
    };

    // Non-object rule
    expect(() => validatePolicyConfig({ version: '1.0', rules: [null] })).toThrow(TypeError);
    expect(() => validatePolicyConfig({ version: '1.0', rules: ['rule_string'] })).toThrow(TypeError);

    // Missing ID
    expect(() => validatePolicyConfig({
      version: '1.0',
      rules: [{ ...baseRule, id: '' }]
    })).toThrow(/valid "id"/);

    // Missing Name
    expect(() => validatePolicyConfig({
      version: '1.0',
      rules: [{ ...baseRule, name: '' }]
    })).toThrow(/valid "name"/);

    // Missing / Non-numeric priority
    expect(() => validatePolicyConfig({
      version: '1.0',
      rules: [{ ...baseRule, priority: 'high' as any }]
    })).toThrow(/numeric "priority"/);

    // Missing action block
    expect(() => validatePolicyConfig({
      version: '1.0',
      rules: [{ id: 'rule-1', name: 'R1', priority: 10 }]
    })).toThrow(/action/);

    // Invalid verdict enum
    expect(() => validatePolicyConfig({
      version: '1.0',
      rules: [{ ...baseRule, action: { verdict: 'EXECUTE_ANYWAY', reason: 'Bad' } }]
    })).toThrow(/invalid verdict/);

    // Missing action reason
    expect(() => validatePolicyConfig({
      version: '1.0',
      rules: [{ ...baseRule, action: { verdict: 'BLOCK', reason: '' } }]
    })).toThrow(/reason/);
  });
});
