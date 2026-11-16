export class ChmodPermissionGuard {
    static isSafePermission(modeOctal) {
        // Check if other (last octal digit) has write permission (bit 2)
        const otherBits = modeOctal & 0o007;
        return (otherBits & 0o002) === 0;
    }
}
//# sourceMappingURL=chmod_permission_guard.js.map