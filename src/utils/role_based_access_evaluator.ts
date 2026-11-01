export class RoleBasedAccessEvaluator {
  public static hasPermission(granted: string[], required: string): boolean {
    if (!Array.isArray(granted) || !required) return false;
    if (granted.includes('*') || granted.includes(required)) return true;

    return granted.some(perm => {
      if (perm.endsWith(':*')) {
        const prefix = perm.slice(0, -2);
        return required.startsWith(prefix + ':');
      }
      return false;
    });
  }
}
