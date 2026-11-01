export class LogfmtFormatter {
  public static format(record: Record<string, any>): string {
    if (!record || typeof record !== 'object') return '';
    const parts: string[] = [];

    for (const [key, value] of Object.entries(record)) {
      if (value === null || value === undefined) continue;
      const cleanKey = key.trim().replace(/[^a-zA-Z0-9_.-]/g, '_');
      const valStr = String(value);

      if (valStr.includes(' ') || valStr.includes('"') || valStr.includes('=')) {
        const escaped = valStr.replace(/"/g, '\\"');
        parts.push(`${cleanKey}="${escaped}"`);
      } else {
        parts.push(`${cleanKey}=${valStr}`);
      }
    }

    return parts.join(' ');
  }
}
