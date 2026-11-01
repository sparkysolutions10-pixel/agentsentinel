/**
 * Matches semantic version strings against common range expressions.
 */
export class SemverRangeMatcher {
  public static satisfies(version: string, range: string): boolean {
    if (!version || !range) return false;

    const v = this.parse(version);
    if (!v) return false;

    const r = range.trim();

    if (r === '*' || r === 'latest') return true;

    if (r.startsWith('^')) {
      const target = this.parse(r.slice(1));
      if (!target) return false;
      if (v.major !== target.major) return false;
      return this.compare(v, target) >= 0;
    }

    if (r.startsWith('~')) {
      const target = this.parse(r.slice(1));
      if (!target) return false;
      if (v.major !== target.major || v.minor !== target.minor) return false;
      return this.compare(v, target) >= 0;
    }

    if (r.startsWith('>=')) {
      const target = this.parse(r.slice(2));
      return target ? this.compare(v, target) >= 0 : false;
    }

    if (r.startsWith('<=')) {
      const target = this.parse(r.slice(2));
      return target ? this.compare(v, target) <= 0 : false;
    }

    if (r.startsWith('>')) {
      const target = this.parse(r.slice(1));
      return target ? this.compare(v, target) > 0 : false;
    }

    if (r.startsWith('<')) {
      const target = this.parse(r.slice(1));
      return target ? this.compare(v, target) < 0 : false;
    }

    const exact = this.parse(r);
    return exact ? this.compare(v, exact) === 0 : false;
  }

  private static parse(vStr: string): { major: number; minor: number; patch: number } | null {
    const clean = vStr.trim().replace(/^v/, '');
    const parts = clean.split('.');
    if (parts.length < 1 || parts.length > 3) return null;

    const major = parseInt(parts[0], 10);
    const minor = parts.length > 1 ? parseInt(parts[1], 10) : 0;
    const patch = parts.length > 2 ? parseInt(parts[2], 10) : 0;

    if (isNaN(major) || isNaN(minor) || isNaN(patch)) return null;
    return { major, minor, patch };
  }

  private static compare(a: { major: number; minor: number; patch: number }, b: { major: number; minor: number; patch: number }): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
  }
}
