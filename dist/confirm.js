/**
 * Asynchronous human-in-the-loop CONFIRM callback bridge.
 * Pauses tool execution and resolves when human operator approves, rejects, or request times out.
 */
import { Verdict } from './types.js';
export class ConfirmationBridge {
    pending = new Map();
    listeners = new Set();
    defaultTimeoutMs;
    autoRejectOnTimeout;
    constructor(options = {}) {
        this.defaultTimeoutMs = options.defaultTimeoutMs ?? 30_000;
        this.autoRejectOnTimeout = options.autoRejectOnTimeout ?? true;
    }
    /**
     * Subscribes a listener to receive new confirmation requests.
     * Returns an unsubscribe function.
     */
    onRequest(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    /**
     * Emits a request for human-in-the-loop confirmation.
     * Pauses and returns a Promise that resolves when approved, rejected, or timed out.
     */
    requestConfirmation(context, options = {}) {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
        const ruleId = options.violation?.ruleId;
        const reason = options.violation?.reason;
        const prompt = options.prompt || (options.violation
            ? `Human confirmation required: Rule [${ruleId}] flagged ${context.toolName} - ${reason}`
            : `Action requires human confirmation before executing tool [${context.toolName}].`);
        const summary = {
            requestId,
            toolCallId: context.id,
            toolName: context.toolName,
            category: context.category,
            params: context.params,
            ruleId,
            reason,
            prompt,
            createdAt: Date.now(),
            timeoutMs,
        };
        const startTime = process.hrtime.bigint();
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                if (!this.pending.has(requestId))
                    return;
                this.pending.delete(requestId);
                const elapsedMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
                resolve({
                    requestId,
                    approved: false,
                    verdict: Verdict.BLOCK,
                    reason: 'Confirmation request timed out without human operator response.',
                    timedOut: true,
                    latencyMs: Number(elapsedMs.toFixed(3)),
                });
            }, timeoutMs);
            // Prevent timer from hanging the Node.js event loop
            if (typeof timer.unref === 'function') {
                timer.unref();
            }
            this.pending.set(requestId, {
                summary,
                resolve,
                reject,
                timer,
                startTime,
            });
            // Notify all registered listeners
            for (const listener of this.listeners) {
                try {
                    listener(summary);
                }
                catch (err) {
                    console.error('[AgentSentinel] Error in onRequest listener:', err);
                }
            }
        });
    }
    /**
     * Approves a pending confirmation request.
     */
    approve(requestId, reason) {
        const entry = this.pending.get(requestId);
        if (!entry)
            return false;
        clearTimeout(entry.timer);
        this.pending.delete(requestId);
        const elapsedMs = Number(process.hrtime.bigint() - entry.startTime) / 1_000_000;
        entry.resolve({
            requestId,
            approved: true,
            verdict: Verdict.ALLOW,
            reason: reason || 'Approved by human operator.',
            timedOut: false,
            latencyMs: Number(elapsedMs.toFixed(3)),
        });
        return true;
    }
    /**
     * Rejects a pending confirmation request.
     */
    reject(requestId, reason) {
        const entry = this.pending.get(requestId);
        if (!entry)
            return false;
        clearTimeout(entry.timer);
        this.pending.delete(requestId);
        const elapsedMs = Number(process.hrtime.bigint() - entry.startTime) / 1_000_000;
        entry.resolve({
            requestId,
            approved: false,
            verdict: Verdict.BLOCK,
            reason: reason || 'Rejected by human operator.',
            timedOut: false,
            latencyMs: Number(elapsedMs.toFixed(3)),
        });
        return true;
    }
    /**
     * Returns a list of all active pending confirmation requests.
     */
    getPendingRequests() {
        return Array.from(this.pending.values()).map(p => p.summary);
    }
    /**
     * Retrieves a specific pending confirmation request by id.
     */
    getPendingRequest(requestId) {
        return this.pending.get(requestId)?.summary;
    }
    /**
     * Returns count of currently pending confirmation requests.
     */
    get pendingCount() {
        return this.pending.size;
    }
    /**
     * Clears and cancels all pending requests.
     */
    clear() {
        for (const [id, entry] of this.pending.entries()) {
            clearTimeout(entry.timer);
            const elapsedMs = Number(process.hrtime.bigint() - entry.startTime) / 1_000_000;
            entry.resolve({
                requestId: id,
                approved: false,
                verdict: Verdict.BLOCK,
                reason: 'Confirmation bridge cleared.',
                timedOut: false,
                latencyMs: Number(elapsedMs.toFixed(3)),
            });
        }
        this.pending.clear();
    }
}
//# sourceMappingURL=confirm.js.map