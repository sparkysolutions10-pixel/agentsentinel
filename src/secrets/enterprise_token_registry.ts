/**
 * Enterprise Proprietary Token Registry & Custom Regex Scrubber.
 * Allows enterprises to register custom proprietary token schemas, internal service keys,
 * and custom regex rules with customizable masking and AgentSentinel rule enforcement.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface EnterpriseTokenRule {
  name: string;
  pattern: RegExp;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  mask?: (raw: string) => string;
  replacement?: string;
  minEntropy?: number;
}

export interface CustomTokenMatch {
  ruleName: string;
  rawToken: string;
  maskedToken: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  startIndex: number;
  endIndex: number;
  paramLocation?: string;
}

export interface CustomTokenScrubResult {
  hasMatches: boolean;
  scrubbedText: string;
  matches: CustomTokenMatch[];
}

export interface EnterpriseRuleOptions {
  mode?: 'block' | 'redact';
  defaultReplacement?: string;
}

/**
 * Standard default masking preserving first 4 and last 4 characters.
 */
export function defaultTokenMask(token: string): string {
  if (!token || token.length < 8) return '****';
  const prefix = token.slice(0, 4);
  const suffix = token.slice(-4);
  return `${prefix}***${suffix}`;
}

export class EnterpriseTokenRegistry {
  private rules: Map<string, EnterpriseTokenRule> = new Map();

  /**
   * Registers a new custom token pattern rule.
   */
  public registerRule(rule: EnterpriseTokenRule): this {
    if (!rule.name || !(rule.pattern instanceof RegExp)) {
      throw new Error('[EnterpriseTokenRegistry] Rule must specify a valid name and RegExp pattern.');
    }

    // Ensure global flag is set for multiple occurrences
    const flags = rule.pattern.flags.includes('g') ? rule.pattern.flags : rule.pattern.flags + 'g';
    const normalizedPattern = new RegExp(rule.pattern.source, flags);

    this.rules.set(rule.name, {
      ...rule,
      pattern: normalizedPattern,
      severity: rule.severity ?? 'high',
      mask: rule.mask ?? defaultTokenMask,
    });

    return this;
  }

  /**
   * Unregisters a custom token rule by name.
   */
  public unregisterRule(name: string): boolean {
    return this.rules.delete(name);
  }

  /**
   * Clears all registered custom rules.
   */
  public clear(): void {
    this.rules.clear();
  }

  /**
   * Returns all currently registered rules.
   */
  public getRules(): EnterpriseTokenRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Scans text for registered proprietary enterprise tokens.
   */
  public detectTokens(text: string): CustomTokenMatch[] {
    if (!text || typeof text !== 'string') return [];

    const matches: CustomTokenMatch[] = [];

    for (const rule of this.rules.values()) {
      rule.pattern.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = rule.pattern.exec(text)) !== null) {
        const rawToken = match[0];
        const maskFn = rule.mask ?? defaultTokenMask;
        const maskedToken = rule.replacement ?? maskFn(rawToken);

        matches.push({
          ruleName: rule.name,
          rawToken,
          maskedToken,
          severity: rule.severity ?? 'high',
          startIndex: match.index,
          endIndex: match.index + rawToken.length,
        });
      }
    }

    return matches.sort((a, b) => a.startIndex - b.startIndex);
  }

  /**
   * Scans text and replaces registered proprietary tokens with masked or replacement strings.
   */
  public scrubTokens(text: string, customReplacement?: string): CustomTokenScrubResult {
    if (!text || typeof text !== 'string') {
      return { hasMatches: false, scrubbedText: text || '', matches: [] };
    }

    const matches = this.detectTokens(text);
    if (matches.length === 0) {
      return { hasMatches: false, scrubbedText: text, matches: [] };
    }

    let scrubbedText = text;
    for (const m of matches) {
      const replacement = customReplacement ?? m.maskedToken;
      scrubbedText = scrubbedText.split(m.rawToken).join(replacement);
    }

    return {
      hasMatches: true,
      scrubbedText,
      matches,
    };
  }

  /**
   * Scans tool context parameters for proprietary enterprise tokens.
   */
  public scanContext(ctx: ToolCallContext): CustomTokenMatch[] {
    if (!ctx.params || typeof ctx.params !== 'object') {
      return [];
    }

    const found: CustomTokenMatch[] = [];

    const traverse = (obj: unknown, path: string): void => {
      if (obj === null || obj === undefined) return;

      if (typeof obj === 'string') {
        const matches = this.detectTokens(obj);
        for (const m of matches) {
          found.push({
            ...m,
            paramLocation: path,
          });
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item, idx) => traverse(item, `${path}[${idx}]`));
      } else if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          traverse(value, path ? `${path}.${key}` : key);
        }
      }
    };

    traverse(ctx.params, '');
    return found;
  }

  /**
   * Redacts proprietary tokens in tool call parameters.
   */
  public redactParams(params: Record<string, any>, customReplacement?: string): Record<string, any> {
    const mutateDeep = (obj: unknown): unknown => {
      if (typeof obj === 'string') {
        const scrubbed = this.scrubTokens(obj, customReplacement);
        return scrubbed.scrubbedText;
      } else if (Array.isArray(obj)) {
        return obj.map((item) => mutateDeep(item));
      } else if (obj !== null && typeof obj === 'object') {
        const res: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) {
          res[k] = mutateDeep(v);
        }
        return res;
      }
      return obj;
    };

    return mutateDeep(params) as Record<string, any>;
  }

  /**
   * Creates an AgentSentinel SentinelRule enforcing registered enterprise token privacy.
   */
  public createSentinelRule(options: EnterpriseRuleOptions = {}): SentinelRule {
    const {
      mode = 'block',
      defaultReplacement,
    } = options;

    return {
      id: 'secrets-enterprise-custom-tokens',
      name: 'Block and Redact Enterprise Proprietary Tokens',
      category: 'secrets',
      priority: 955,
      enabled: true,

      evaluate: (ctx: ToolCallContext): RuleViolation | null => {
        const matches = this.scanContext(ctx);

        if (matches.length === 0) {
          return null;
        }

        const ruleNames = Array.from(new Set(matches.map((m) => m.ruleName))).join(', ');
        const highestSeverity = matches.some((m) => m.severity === 'critical')
          ? 'critical'
          : 'high';

        const locations = matches
          .map((m) => m.paramLocation)
          .filter(Boolean)
          .join(', ');

        if (mode === 'redact') {
          return {
            ruleId: 'secrets-enterprise-custom-tokens',
            ruleName: 'Block and Redact Enterprise Proprietary Tokens',
            severity: highestSeverity,
            verdict: Verdict.REDACT,
            reason: `Enterprise token intercepted and redacted: ${ruleNames}${locations ? ` in [${locations}]` : ''}`,
            redactedParams: this.redactParams(ctx.params, defaultReplacement),
          };
        }

        return {
          ruleId: 'secrets-enterprise-custom-tokens',
          ruleName: 'Block and Redact Enterprise Proprietary Tokens',
          severity: highestSeverity,
          verdict: Verdict.BLOCK,
          reason: `Disallowed enterprise proprietary token exposed in tool parameters: ${ruleNames}${locations ? ` in [${locations}]` : ''}`,
        };
      },
    };
  }
}

export const defaultEnterpriseTokenRegistry = new EnterpriseTokenRegistry();
