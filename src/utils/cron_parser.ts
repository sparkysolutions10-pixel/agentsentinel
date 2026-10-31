/**
 * AgentSentinel - Cron Expression Parser Utility
 * Validates standard 5-part cron expressions and checks timestamp matches.
 */

export class CronParser {
  public static isValid(cron: string): boolean {
    if (!cron || typeof cron !== 'string') return false;
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) return false;

    return (
      this.fieldValid(parts[0], 0, 59) && // min
      this.fieldValid(parts[1], 0, 23) && // hour
      this.fieldValid(parts[2], 1, 31) && // dom
      this.fieldValid(parts[3], 1, 12) && // month
      this.fieldValid(parts[4], 0, 6)     // dow
    );
  }

  private static fieldValid(field: string, min: number, max: number): boolean {
    if (field === '*') return true;
    if (field.startsWith('*/')) {
      const step = parseInt(field.slice(2), 10);
      return !isNaN(step) && step > 0 && step <= max;
    }
    const num = parseInt(field, 10);
    return !isNaN(num) && num >= min && num <= max;
  }

  public static matches(cron: string, date: Date): boolean {
    if (!this.isValid(cron)) return false;
    const parts = cron.trim().split(/\s+/);
    const m = date.getMinutes();
    const h = date.getHours();
    const dom = date.getDate();
    const mon = date.getMonth() + 1;
    const dow = date.getDay();

    return (
      this.matchField(parts[0], m) &&
      this.matchField(parts[1], h) &&
      this.matchField(parts[2], dom) &&
      this.matchField(parts[3], mon) &&
      this.matchField(parts[4], dow)
    );
  }

  private static matchField(field: string, val: number): boolean {
    if (field === '*') return true;
    if (field.startsWith('*/')) {
      const step = parseInt(field.slice(2), 10);
      return val % step === 0;
    }
    return parseInt(field, 10) === val;
  }
}
