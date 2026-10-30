import { describe, it, expect } from 'vitest';
import {
  isValidLuhn,
  detectCreditCards,
  scrubCreditCards,
  createCreditCardScrubberRule,
} from '../src/secrets/credit_card_scrubber.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Luhn Validator False Positive Reduction', () => {
  // Real valid credit cards
  const validCards = [
    '4000000000000002', // Visa
    '4532015112830366', // Visa
    '5500000000000004', // MasterCard
    '378282246310005',  // Amex (15 digits)
    '6011000000000004', // Discover
  ];

  // Common random 16-digit IDs in software systems that are NOT credit cards
  const nonCardIdentifiers = [
    '1730291823123456', // Microsecond timestamp
    '9876543210987654', // Database record sequence ID
    '1020304050607080', // Network session tracking token
    '1122334455667788', // Distributed tracing span ID
    '9988776655443322', // Internal order confirmation ref
    '1234567890123456', // Sequential test counter
    '5555444433332221', // Arbitrary 16-digit telemetry hash
    '8888777766665554', // Hardware serial number
  ];

  describe('False Positive Reduction Comparison', () => {
    it('filters out Luhn-invalid 16-digit random system identifiers', () => {
      let falsePositivesWithoutLuhn = 0;
      let falsePositivesWithLuhn = 0;

      for (const id of nonCardIdentifiers) {
        // Without Luhn validation
        const rawMatches = detectCreditCards(`ID: ${id}`, false);
        if (rawMatches.length > 0) falsePositivesWithoutLuhn++;

        // With Luhn validation
        const luhnMatches = detectCreditCards(`ID: ${id}`, true);
        if (luhnMatches.length > 0) falsePositivesWithLuhn++;
      }

      // Without Luhn, all 8 IDs would be falsely flagged as credit cards
      expect(falsePositivesWithoutLuhn).toBe(nonCardIdentifiers.length);

      // With Luhn, false positives are dramatically reduced
      expect(falsePositivesWithLuhn).toBeLessThanOrEqual(1);
    });

    it('preserves 100% true positive detection on genuine payment cards', () => {
      for (const card of validCards) {
        const matches = detectCreditCards(`Payment card: ${card}`, true);
        expect(matches).toHaveLength(1);
        expect(matches[0].hasValidLuhn).toBe(true);
      }
    });
  });

  describe('Realistic Business System Payloads', () => {
    it('preserves order IDs and timestamps without corrupting them', () => {
      const payload = {
        orderId: 'ORD-9876543210987654',
        timestampMicros: '1730291823123456',
        traceId: '1020304050607080',
      };

      const jsonStr = JSON.stringify(payload);
      const scrubbed = scrubCreditCards(jsonStr);

      // Since none are valid Luhn numbers, text remains uncorrupted
      expect(scrubbed.hasMatches).toBe(false);
      expect(scrubbed.scrubbedText).toBe(jsonStr);
    });

    it('accurately isolates and redacts genuine card numbers while preserving surrounding order IDs', () => {
      const mixedText = [
        'Order ID: 9876543210987654',
        'Timestamp: 1730291823123456',
        'Customer Card: 4000000000000002',
      ].join('\n');

      const result = scrubCreditCards(mixedText, { replacement: '[REDACTED_CARD]' });
      expect(result.hasMatches).toBe(true);

      // Card is redacted
      expect(result.scrubbedText).toContain('Customer Card: [REDACTED_CARD]');

      // Order ID and timestamp remain untouched
      expect(result.scrubbedText).toContain('Order ID: 9876543210987654');
      expect(result.scrubbedText).toContain('Timestamp: 1730291823123456');
    });
  });

  describe('AgentSentinel Rule False-Positive Immunity', () => {
    const rule = createCreditCardScrubberRule({ mode: 'block', requireLuhn: true });

    it('does not block benign database queries containing 16-digit serial keys', () => {
      const ctx: ToolCallContext = {
        id: 'sql-query-call',
        toolName: 'query_database',
        params: {
          sql: 'SELECT * FROM orders WHERE tracking_number = 9876543210987654',
          sessionKey: '1020304050607080',
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('promptly blocks genuine credit cards in tool calls', () => {
      const ctx: ToolCallContext = {
        id: 'card-payment-call',
        toolName: 'stripe_charge',
        params: {
          pan: '4532015112830366',
          cvv: '999',
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('Visa');
    });
  });
});
