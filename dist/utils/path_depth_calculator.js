import path from 'path';
/**
 * PathDepthCalculator - Path segment depth calculator and nesting ceiling enforcer.
 */
export class PathDepthCalculator {
    static calculateDepth(filePath) {
        if (!filePath || typeof filePath !== 'string')
            return 0;
        const normalized = path.normalize(filePath).replace(/^(\/|\\)+/, '');
        const segments = normalized.split(/[\/\\]+/).filter(s => s.length > 0 && s !== '.');
        return segments.length;
    }
    static isWithinMaxDepth(filePath, maxDepth) {
        if (maxDepth < 0)
            return false;
        return this.calculateDepth(filePath) <= maxDepth;
    }
}
//# sourceMappingURL=path_depth_calculator.js.map