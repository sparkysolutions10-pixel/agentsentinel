export class CookieHeaderParser {
    static parse(header) {
        if (!header || typeof header !== 'string')
            return {};
        const result = {};
        const pairs = header.split(';');
        for (const pair of pairs) {
            const eqIdx = pair.indexOf('=');
            if (eqIdx === -1)
                continue;
            const key = pair.substring(0, eqIdx).trim();
            const val = pair.substring(eqIdx + 1).trim();
            try {
                result[key] = decodeURIComponent(val);
            }
            catch {
                result[key] = val;
            }
        }
        return result;
    }
}
//# sourceMappingURL=cookie_header_parser.js.map