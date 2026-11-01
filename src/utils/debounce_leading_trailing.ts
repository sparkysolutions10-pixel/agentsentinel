export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
}

export class DebounceLeadingTrailing {
  public static create<T extends (...args: any[]) => any>(
    fn: T,
    delayMs: number,
    options: DebounceOptions = { trailing: true }
  ): (...args: Parameters<T>) => void {
    let timer: any = null;
    let leadingExecuted = false;

    return (...args: Parameters<T>) => {
      const isLeading = options.leading && !leadingExecuted;

      if (isLeading) {
        fn(...args);
        leadingExecuted = true;
      }

      if (timer) clearTimeout(timer);

      timer = setTimeout(() => {
        if (options.trailing && !isLeading) {
          fn(...args);
        }
        leadingExecuted = false;
        timer = null;
      }, delayMs);
    };
  }
}
