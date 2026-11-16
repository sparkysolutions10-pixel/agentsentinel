export class RoleBasedAccessEvaluator {
    static hasPermission(granted, required) {
        if (!Array.isArray(granted) || !required)
            return false;
        if (granted.includes('*') || granted.includes(required))
            return true;
        return granted.some(perm => {
            if (perm.endsWith(':*')) {
                const prefix = perm.slice(0, -2);
                return required.startsWith(prefix + ':');
            }
            return false;
        });
    }
}
//# sourceMappingURL=role_based_access_evaluator.js.map