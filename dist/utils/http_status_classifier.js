export class HttpStatusClassifier {
    static isSuccess(status) {
        return status >= 200 && status < 300;
    }
    static isClientError(status) {
        return status >= 400 && status < 500;
    }
    static isServerError(status) {
        return status >= 500 && status < 600;
    }
    static isRetryable(status) {
        return [408, 429, 502, 503, 504].includes(status);
    }
}
//# sourceMappingURL=http_status_classifier.js.map