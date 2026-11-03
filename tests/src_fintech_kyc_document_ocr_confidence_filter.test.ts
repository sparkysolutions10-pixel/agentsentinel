import { describe, it, expect } from 'vitest';
import { KycDocumentOcrConfidenceFilter } from '../src/fintech/kyc_document_ocr_confidence_filter.js';

describe('KycDocumentOcrConfidenceFilter Invariant Suite (#1987)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = KycDocumentOcrConfidenceFilter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_KYC_DOCUMENT_OCR_CONFIDENCE_FILTER');
    expect(KycDocumentOcrConfidenceFilter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = KycDocumentOcrConfidenceFilter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(KycDocumentOcrConfidenceFilter.validate('git status && npm run test')).toBe(true);
  });
});
