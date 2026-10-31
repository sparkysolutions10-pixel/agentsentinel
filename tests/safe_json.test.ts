import { describe, it, expect } from 'vitest';
import { SafeJson } from '../src/utils/safe_json.js';

describe('SafeJson', () => {
  it('safely serializes circular references without throwing', () => {
    const obj: any = { name: 'agent' };
    obj.self = obj;

    const str = SafeJson.stringify(obj);
    expect(str).toContain('"self":"[Circular]"');
  });

  it('safely serializes BigInt values', () => {
    const obj = { amount: BigInt(123456789) };
    const str = SafeJson.stringify(obj);
    expect(str).toContain('"123456789n"');
  });

  it('safely parses invalid JSON with fallback', () => {
    const result = SafeJson.parseSafe('invalid json {', { default: true });
    expect(result).toEqual({ default: true });
  });
});
