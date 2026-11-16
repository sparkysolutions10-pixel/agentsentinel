export class RecursiveBracketDepthGuard {
    static getMaxDepth(input) {
        if (!input || typeof input !== 'string')
            return 0;
        let currentDepth = 0;
        let maxDepth = 0;
        for (const char of input) {
            if (char === '(' || char === '[' || char === '{') {
                currentDepth++;
                if (currentDepth > maxDepth)
                    maxDepth = currentDepth;
            }
            else if (char === ')' || char === ']' || char === '}') {
                if (currentDepth > 0)
                    currentDepth--;
            }
        }
        return maxDepth;
    }
    static isSafe(input, maxAllowedDepth = 20) {
        return this.getMaxDepth(input) <= maxAllowedDepth;
    }
}
//# sourceMappingURL=recursive_bracket_depth_guard.js.map