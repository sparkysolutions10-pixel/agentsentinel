/**
 * AgentSentinel - Byte Size Formatter Utility
 * Formats byte counts into human units and parses scale strings back to bytes.
 */

export class ByteSizeFormatter {
  private static readonly UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  public static format(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 B';
    if (bytes < 0) return `-${this.format(-bytes, decimals)}`;
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const unit = this.UNITS[Math.min(i, this.UNITS.length - 1)];
    const val = bytes / Math.pow(k, i);
    return `${parseFloat(val.toFixed(decimals))} ${unit}`;
  }

  public static parse(str: string): number {
    if (!str || typeof str !== 'string') return 0;
    const match = str.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);
    if (!match) return 0;
    const val = parseFloat(match[1]);
    const unit = (match[2] || 'B').toUpperCase();
    const multipliers: Record<string, number> = {
      B: 1,
      KB: 1024,
      K: 1024,
      MB: 1024 * 1024,
      M: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
      G: 1024 * 1024 * 1024,
      TB: 1024 * 1024 * 1024 * 1024,
      T: 1024 * 1024 * 1024 * 1024
    };
    return Math.round(val * (multipliers[unit] || 1));
  }
}
