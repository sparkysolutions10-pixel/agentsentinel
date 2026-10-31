/**
 * DeadlockTimeoutGuard - Promise timeout boundary enforcer.
 */

export class DeadlockTimeoutGuard {
  public static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operationName: string = 'Operation'
  ): Promise<T> {
    let timer: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer!);
    }
  }
}
