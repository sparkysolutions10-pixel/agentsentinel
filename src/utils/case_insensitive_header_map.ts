/**
 * AgentSentinel - Case Insensitive Header Map Utility
 * Manages HTTP headers with case-insensitive key lookups while preserving original keys.
 */

export class CaseInsensitiveHeaderMap {
  private map: Map<string, { originalKey: string; value: string }> = new Map();

  constructor(initial?: Record<string, string>) {
    if (initial) {
      for (const [k, v] of Object.entries(initial)) {
        this.set(k, v);
      }
    }
  }

  public set(key: string, value: string): void {
    if (!key) return;
    this.map.set(key.toLowerCase(), { originalKey: key, value });
  }

  public get(key: string): string | undefined {
    if (!key) return undefined;
    return this.map.get(key.toLowerCase())?.value;
  }

  public has(key: string): boolean {
    if (!key) return false;
    return this.map.has(key.toLowerCase());
  }

  public delete(key: string): boolean {
    if (!key) return false;
    return this.map.delete(key.toLowerCase());
  }

  public toObject(): Record<string, string> {
    const obj: Record<string, string> = {};
    for (const entry of this.map.values()) {
      obj[entry.originalKey] = entry.value;
    }
    return obj;
  }
}
