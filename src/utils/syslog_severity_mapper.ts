export class SyslogSeverityMapper {
  private static readonly SEVERITY_MAP: Record<string, number> = {
    critical: 2, // Critical
    high: 3,     // Error
    medium: 4,   // Warning
    low: 6,      // Informational
    info: 6,
    debug: 7
  };

  public static toSyslogSeverity(level: string): number {
    const clean = (level || '').trim().toLowerCase();
    return this.SEVERITY_MAP[clean] ?? 5; // Notice default
  }
}
