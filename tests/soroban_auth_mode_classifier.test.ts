import { describe, it, expect } from 'vitest';
import { SorobanAuthModeClassifier } from '../src/utils/soroban_auth_mode_classifier.js';

describe('SorobanAuthModeClassifier', () => {
  it('classifies credentials into Soroban auth modes', () => {
    expect(SorobanAuthModeClassifier.classify({ type: 'soroban_credentials_address' })).toBe('Address');
    expect(SorobanAuthModeClassifier.classify({ type: 'soroban_credentials_contract' })).toBe('Contract');
    expect(SorobanAuthModeClassifier.classify(null)).toBe('None');
  });
});
