/**
 * AgentSentinel - Duration Parser Utility
 * Converts human readable duration strings to milliseconds and formats back.
 */

export class DurationParser {
  public static parseToMs(duration: string): number {
    if (!duration || typeof duration !== 'string') {
      throw new Error(`Invalid duration string: "${duration}"`);
    }
    const match = duration.trim().match(/^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d|w)$/i);
    if (!match) {
      throw new Error(`Cannot parse duration: "${duration}"`);
    }

    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'ms': return Math.round(value);
      case 's': return Math.round(value * 1000);
      case 'm': return Math.round(value * 60 * 1000);
      case 'h': return Math.round(value * 3600 * 1000);
      case 'd': return Math.round(value * 86400 * 1000);
      case 'w': return Math.round(value * 7 * 86400 * 1000);
      default: throw new Error(`Unknown duration unit: ${unit}`);
    }
  }

  public static format(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1).replace(/\.0$/, '')}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1).replace(/\.0$/, '')}m`;
    if (ms < 86400000) return `${(ms / 3600000).toFixed(1).replace(/\.0$/, '')}h`;
    return `${(ms / 86400000).toFixed(1).replace(/\.0$/, '')}d`;
  }
}
