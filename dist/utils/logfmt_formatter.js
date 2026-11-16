export class LogfmtFormatter {
    static format(record) {
        if (!record || typeof record !== 'object')
            return '';
        const parts = [];
        for (const [key, value] of Object.entries(record)) {
            if (value === null || value === undefined)
                continue;
            const cleanKey = key.trim().replace(/[^a-zA-Z0-9_.-]/g, '_');
            const valStr = String(value);
            if (valStr.includes(' ') || valStr.includes('"') || valStr.includes('=')) {
                const escaped = valStr.replace(/"/g, '\\"');
                parts.push(`${cleanKey}="${escaped}"`);
            }
            else {
                parts.push(`${cleanKey}=${valStr}`);
            }
        }
        return parts.join(' ');
    }
}
//# sourceMappingURL=logfmt_formatter.js.map