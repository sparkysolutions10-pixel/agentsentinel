export class PromiseTimeoutWrapper {
  public static async withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string = 'Operation timed out'): Promise<T> {
    let timer: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  }
}
