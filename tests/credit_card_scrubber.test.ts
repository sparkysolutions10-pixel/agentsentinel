import { describe, it, expect } from 'vitest';
import {
  isValidLuhn,
  identifyCardBrand,
  detectCreditCards,
  scrubCreditCards,
  maskCreditCard,
  createCreditCardScrubberRule,
} from '../src/secrets/credit_card_scrubber.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Credit Card Scrubber (Luhn Algorithm)', () => {
  const validVisa = '4000-0000-0000-0002';
  const validMasterCard = '5500 0000 0000 0004';
  const validAmex = '3782-822463-10005';
  const validDiscover = '6011-0000-0000-0004';
  const invalidCard = '4111-1111-1111-1112'; // Fails Luhn check (sum % 10 != 0)

  describe('isValidLuhn', () => {
    it('returns true for mathematically valid card numbers', () => {
      expect(isValidLuhn(validVisa)).toBe(true);
      expect(isValidLuhn(validMasterCard)).toBe(true);
      expect(isValidLuhn(validAmex)).toBe(true);
      expect(isValidLuhn('4532015112830366')).toBe(true);
    });

    it('returns false for invalid numbers', () => {
      expect(isValidLuhn(invalidCard)).toBe(false);
      expect(isValidLuhn('1234567890123456')).toBe(false);
      expect(isValidLuhn('123')).toBe(false);
    });
  });

  describe('identifyCardBrand', () => {
    it('accurately identifies card networks based on IIN prefix', () => {
      expect(identifyCardBrand(validVisa)).toBe('Visa');
      expect(identifyCardBrand(validMasterCard)).toBe('MasterCard');
      expect(identifyCardBrand(validAmex)).toBe('AmericanExpress');
      expect(identifyCardBrand(validDiscover)).toBe('Discover');
    });
  });

  describe('detectCreditCards', () => {
    it('detects valid credit cards formatted with dashes or spaces', () => {
      const text = `Payments: Visa ${validVisa} and MasterCard ${validMasterCard}`;
      const matches = detectCreditCards(text, true);

      expect(matches).toHaveLength(2);
      expect(matches[0].brand).toBe('Visa');
      expect(matches[1].brand).toBe('MasterCard');
      expect(matches[0].hasValidLuhn).toBe(true);
    });

    it('filters out Luhn-invalid 16-digit sequences when requireLuhn is true', () => {
      const text = `Order Reference: ${invalidCard}`;
      const matches = detectCreditCards(text, true);

      expect(matches).toHaveLength(0);
    });
  });

  describe('maskCreditCard and scrubCreditCards', () => {
    it('masks according to PCI-DSS standards retaining first 6 and last 4', () => {
      const masked = maskCreditCard('4000000000000002', 'pci_dss');
      expect(masked).toBe('400000******0002');
    });

    it('scrubs card numbers and associated CVVs in text', () => {
      const input = `Card: ${validVisa}, CVV: 842, Exp: 12/28`;
      const result = scrubCreditCards(input);

      expect(result.hasMatches).toBe(true);
      expect(result.scrubbedText).not.toContain('4000-0000-0000-0002');
      expect(result.scrubbedText).not.toContain('CVV: 842');
      expect(result.scrubbedText).toContain('CVV: ***');
    });
  });

  describe('createCreditCardScrubberRule', () => {
    const rule = createCreditCardScrubberRule();

    it('allows clean tool contexts with order IDs or non-card numbers', () => {
      const ctx: ToolCallContext = {
        id: 'clean-order',
        toolName: 'query_order',
        params: { orderId: 'ORD-9876543210' },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('blocks tool calls with valid credit card numbers in params', () => {
      const ctx: ToolCallContext = {
        id: 'card-leak',
        toolName: 'process_payment',
        params: {
          cardNumber: validVisa,
          amount: 99.99,
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('Disallowed Credit Card number (PAN) leaked');
    });

    it('redacts card numbers when configured in redact mode', () => {
      const redactRule = createCreditCardScrubberRule({ mode: 'redact' });
      const ctx: ToolCallContext = {
        id: 'card-redact',
        toolName: 'checkout',
        params: {
          pan: validVisa,
        },
        timestamp: Date.now(),
      };

      const violation = redactRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.REDACT);
      expect(violation?.redactedParams?.pan).toBe('[REDACTED_CREDIT_CARD]');
    });
  });
});
