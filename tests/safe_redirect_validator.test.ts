import { describe, it, expect } from 'vitest';
import { SafeRedirectValidator } from '../src/utils/safe_redirect_validator.js';

describe('SafeRedirectValidator', () => {
  it('allows safe relative paths', () => {
    expect(SafeRedirectValidator.isSafe('/dashboard')).toBe(true);
    expect(SafeRedirectValidator.isSafe('//evil.com')).toBe(false);
  });

  it('checks allowed hosts for absolute URLs', () => {
    expect(SafeRedirectValidator.isSafe('https://app.sentinel.dev/login', ['app.sentinel.dev'])).toBe(true);
    expect(SafeRedirectValidator.isSafe('https://evil.com/phish', ['app.sentinel.dev'])).toBe(false);
  });
});
