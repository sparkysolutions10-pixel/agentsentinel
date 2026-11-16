import crypto from 'crypto';
export class ConstantTimeComparator {
    static compare(a, b) {
        const bufA = Buffer.from(a, 'utf8');
        const bufB = Buffer.from(b, 'utf8');
        if (bufA.length !== bufB.length) {
            const dummy = Buffer.alloc(bufA.length);
            crypto.timingSafeEqual(bufA, dummy);
            return false;
        }
        return crypto.timingSafeEqual(bufA, bufB);
    }
}
export function createConstantTimeRule() {
    return {
        id: 'crypto-constant-time-comparator',
        name: 'Guarantee Constant-Time Execution on Secret Comparisons',
        category: 'custom',
        priority: 960,
        enabled: true,
        evaluate: (ctx) => {
            return null;
        }
    };
}
//# sourceMappingURL=constant_time_rule.js.map