/**
 * AgentSentinel - LangChain Stellar Agent Toolkit Security Interceptor
 * Intercepts tool calls issued by LangChain agents targeting Stellar/Soroban tools
 * to enforce autonomous zero-trust execution policies.
 */
import { Verdict } from '../types.js';
export class LangChainStellarSecurityInterceptor {
    engine;
    constructor(config) {
        this.engine = config.engine;
    }
    async intercept(toolName, input) {
        const params = typeof input === 'object' && input !== null ? input : { query: String(input) };
        const context = {
            id: `langchain_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            toolName,
            params,
            timestamp: Date.now()
        };
        const evaluation = await this.engine.evaluate(context);
        if (evaluation.verdict === Verdict.BLOCK || !evaluation.allowed) {
            const reasons = evaluation.violations.map(v => v.reason).join('; ');
            return `[AgentSentinel Security Intercepted] Tool invocation blocked: ${reasons}`;
        }
        return evaluation.redactedParams || input;
    }
}
//# sourceMappingURL=langchain_stellar_interceptor.js.map