/**
 * ExecutableBitInspector - POSIX file mode bitmask execute inspector.
 */
export interface ExecutablePermissions {
    user: boolean;
    group: boolean;
    others: boolean;
    isExecutable: boolean;
}
export declare class ExecutableBitInspector {
    static readonly S_IXUSR = 64;
    static readonly S_IXGRP = 8;
    static readonly S_IXOTH = 1;
    static inspect(mode: number): ExecutablePermissions;
}
//# sourceMappingURL=executable_bit_inspector.d.ts.map