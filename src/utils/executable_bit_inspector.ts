/**
 * ExecutableBitInspector - POSIX file mode bitmask execute inspector.
 */

export interface ExecutablePermissions {
  user: boolean;
  group: boolean;
  others: boolean;
  isExecutable: boolean;
}

export class ExecutableBitInspector {
  public static readonly S_IXUSR = 0o100;
  public static readonly S_IXGRP = 0o010;
  public static readonly S_IXOTH = 0o001;

  public static inspect(mode: number): ExecutablePermissions {
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
