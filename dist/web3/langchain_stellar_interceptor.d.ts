/**
 * AgentSentinel - LangChain Stellar Agent Toolkit Security Interceptor
 * Intercepts tool calls issued by LangChain agents targeting Stellar/Soroban tools
 * to enforce autonomous zero-trust execution policies.
 */
import { SentinelEngine } from '../index.js';
export interface LangChainStellarInterceptorConfig {
    engine: SentinelEngine;
}
export declare class LangChainStellarSecurityInterceptor {
    private engine;
    constructor(config: LangChainStellarInterceptorConfig);
    intercept(toolName: string, input: any): Promise<any>;
}
//# sourceMappingURL=langchain_stellar_interceptor.d.ts.map