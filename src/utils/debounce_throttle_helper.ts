/**
 * DebounceThrottleHelper - Debounce and throttle execution helpers.
 */

export class DebounceThrottleHelper {
  public static debounce<T extends (...args: any[]) => void>(
    fn: T,
    delayMs: number
  ): { (...args: Parameters<T>): void; cancel: () => void } {
    let timer: NodeJS.Timeout | null = null;

    const debounced = (...args: Parameters<T>) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
        timer = null;
      }, delayMs);
    };

    debounced.cancel = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    return debounced;
  }

  public static throttle<T extends (...args: any[]) => void>(
    fn: T,
    intervalMs: number
  ): { (...args: Parameters<T>): void; cancel: () => void } {
    let lastExecution = 0;
    let timer: NodeJS.Timeout | null = null;

    const throttled = (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = intervalMs - (now - lastExecution);

      if (remaining <= 0) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        lastExecution = now;
        fn(...args);
      } else if (!timer) {
        timer = setTimeout(() => {
          lastExecution = Date.now();
          timer = null;
          fn(...args);
        }, remaining);
      }
    };

    throttled.cancel = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    return throttled;
  }
}
