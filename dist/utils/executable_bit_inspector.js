/**
 * ExecutableBitInspector - POSIX file mode bitmask execute inspector.
 */
export class ExecutableBitInspector {
    static S_IXUSR = 0o100;
    static S_IXGRP = 0o010;
    static S_IXOTH = 0o001;
    static inspect(mode) {
        const user = (mode & this.S_IXUSR) !== 0;
        const group = (mode & this.S_IXGRP) !== 0;
        const others = (mode & this.S_IXOTH) !== 0;
        return {
            user,
            group,
            others,
            isExecutable: user || group || others
        };
    }
}
//# sourceMappingURL=executable_bit_inspector.js.map