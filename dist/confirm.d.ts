/**
 * Asynchronous human-in-the-loop CONFIRM callback bridge.
 * Pauses tool execution and resolves when human operator approves, rejects, or request times out.
 */
import { ToolCallContext, RuleViolation, ConfirmDecision, ConfirmRequestSummary } from './types.js';
export interface ConfirmBridgeOptions {
    defaultTimeoutMs?: number;
    autoRejectOnTimeout?: boolean;
}
export interface RequestConfirmationOptions {
    timeoutMs?: number;
    prompt?: string;
    violation?: RuleViolation;
}
export declare class ConfirmationBridge {
    private pending;
    private listeners;
    readonly defaultTimeoutMs: number;
    readonly autoRejectOnTimeout: boolean;
    constructor(options?: ConfirmBridgeOptions);
    /**
     * Subscribes a listener to receive new confirmation requests.
     * Returns an unsubscribe function.
     */
    onRequest(listener: (request: ConfirmRequestSummary) => void): () => void;
    /**
     * Emits a request for human-in-the-loop confirmation.
     * Pauses and returns a Promise that resolves when approved, rejected, or timed out.
     */
    requestConfirmation(context: ToolCallContext, options?: RequestConfirmationOptions): Promise<ConfirmDecision>;
    /**
     * Approves a pending confirmation request.
     */
    approve(requestId: string, reason?: string): boolean;
    /**
     * Rejects a pending confirmation request.
     */
    reject(requestId: string, reason?: string): boolean;
    /**
     * Returns a list of all active pending confirmation requests.
     */
    getPendingRequests(): ConfirmRequestSummary[];
    /**
     * Retrieves a specific pending confirmation request by id.
     */
    getPendingRequest(requestId: string): ConfirmRequestSummary | undefined;
    /**
     * Returns count of currently pending confirmation requests.
     */
    get pendingCount(): number;
    /**
     * Clears and cancels all pending requests.
     */
    clear(): void;
}
//# sourceMappingURL=confirm.d.ts.map