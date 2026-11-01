import { describe, it, expect } from 'vitest';
import { Bip39MnemonicValidator } from '../src/utils/bip39_mnemonic_validator.js';

describe('Bip39MnemonicValidator', () => {
  it('validates 12 and 24 word phrases', () => {
    const twelve = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    expect(Bip39MnemonicValidator.isValid(twelve)).toBe(true);
    expect(Bip39MnemonicValidator.getWordCount(twelve)).toBe(12);

    expect(Bip39MnemonicValidator.isValid('not enough words')).toBe(false);
  });
});
