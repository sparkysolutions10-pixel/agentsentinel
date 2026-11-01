export class AbortControllerTimeout {
  public static create(timeoutMs: number): { controller: AbortController; cleanup: () => void } {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timer);
    };

    return { controller, cleanup };
  }
}
