import { describe, it, expect } from 'vitest';
import { GreetingNormalizer } from '../src/utils/greeting_normalizer.js';

describe('GreetingNormalizer', () => {
  it('identifies and strips international greetings', () => {
    expect(GreetingNormalizer.isGreeting('Hello, please run backup')).toBe(true);
    expect(GreetingNormalizer.stripGreeting('Hello, please run backup')).toBe('please run backup');
    expect(GreetingNormalizer.stripGreeting('Namaste, balance check')).toBe('balance check');
    expect(GreetingNormalizer.stripGreeting('Bonjour! Transfer 10 XLM')).toBe('Transfer 10 XLM');
  });

  it('leaves pure commands untouched', () => {
    expect(GreetingNormalizer.isGreeting('transfer funds')).toBe(false);
    expect(GreetingNormalizer.stripGreeting('transfer funds')).toBe('transfer funds');
  });
});
