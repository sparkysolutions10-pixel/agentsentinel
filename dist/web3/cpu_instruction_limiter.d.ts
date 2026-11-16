/**
 * AgentSentinel - Soroban CPU Instruction Budget Limiter
 * Enforces maximum CPU instruction thresholds on contract simulations
 * to avoid out-of-gas failures and unoptimized compute expenditures.
 */
import { SentinelRule } from '../types.js';
export interface CpuInstructionConfig {
    maxCpuInstructions?: number;
}
export declare function createCpuInstructionLimiterRule(config?: CpuInstructionConfig): SentinelRule;
//# sourceMappingURL=cpu_instruction_limiter.d.ts.map