export class SyslogSeverityMapper {
    static SEVERITY_MAP = {
        critical: 2, // Critical
        high: 3, // Error
        medium: 4, // Warning
        low: 6, // Informational
        info: 6,
        debug: 7
    };
    static toSyslogSeverity(level) {
        const clean = (level || '').trim().toLowerCase();
        return this.SEVERITY_MAP[clean] ?? 5; // Notice default
    }
}
//# sourceMappingURL=syslog_severity_mapper.js.map