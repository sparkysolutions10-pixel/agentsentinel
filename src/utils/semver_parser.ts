/**
 * AgentSentinel - Semver Parser Utility
 * Parses and compares semantic versions for tools, plugins, and dependencies.
 */

export interface SemverObject {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
}

export class SemverParser {
  private static readonly REGEX = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

  public static parse(version: string): SemverObject | null {
    if (!version || typeof version !== 'string') return null;
    const match = version.trim().match(this.REGEX);
    if (!match) return null;
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4]
    };
  }

  public static compare(v1: string, v2: string): number {
    const s1 = this.parse(v1);
    const s2 = this.parse(v2);
    if (!s1 || !s2) throw new Error(`Invalid semver comparison: "${v1}" vs "${v2}"`);

    if (s1.major !== s2.major) return s1.major > s2.major ? 1 : -1;
    if (s1.minor !== s2.minor) return s1.minor > s2.minor ? 1 : -1;
    if (s1.patch !== s2.patch) return s1.patch > s2.patch ? 1 : -1;

    if (s1.prerelease === undefined && s2.prerelease !== undefined) return 1;
    if (s1.prerelease !== undefined && s2.prerelease === undefined) return -1;
    if (s1.prerelease && s2.prerelease) {
      if (s1.prerelease > s2.prerelease) return 1;
      if (s1.prerelease < s2.prerelease) return -1;
    }
    return 0;
  }

  public static satisfies(version: string, minVersion: string): boolean {
    return this.compare(version, minVersion) >= 0;
  }
}
