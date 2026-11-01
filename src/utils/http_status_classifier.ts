export class HttpStatusClassifier {
  public static isSuccess(status: number): boolean {
    return status >= 200 && status < 300;
  }

  public static isClientError(status: number): boolean {
    return status >= 400 && status < 500;
  }

  public static isServerError(status: number): boolean {
    return status >= 500 && status < 600;
  }

  public static isRetryable(status: number): boolean {
    return [408, 429, 502, 503, 504].includes(status);
  }
}
