import { describe, it, expect } from 'vitest';
import { HttpStatusClassifier } from '../src/utils/http_status_classifier.js';

describe('HttpStatusClassifier', () => {
  it('classifies status codes accurately', () => {
    expect(HttpStatusClassifier.isSuccess(200)).toBe(true);
    expect(HttpStatusClassifier.isClientError(404)).toBe(true);
    expect(HttpStatusClassifier.isServerError(500)).toBe(true);
    expect(HttpStatusClassifier.isRetryable(429)).toBe(true);
    expect(HttpStatusClassifier.isRetryable(503)).toBe(true);
    expect(HttpStatusClassifier.isRetryable(400)).toBe(false);
  });
});
