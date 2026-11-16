import { CliOptions } from './types.js';
export type PolicyPreset = 'enterprise' | 'developer' | 'minimal';
export interface InitResult {
    success: boolean;
    filePath: string;
    preset: PolicyPreset;
    message: string;
}
export declare const PRESET_CONFIGS: Record<PolicyPreset, object>;
/**
 * Scaffolds an agentsentinel.policy.json configuration file.
 */
export declare function scaffoldPolicy(targetPathOrDir: string, preset?: PolicyPreset, force?: boolean): InitResult;
/**
 * Handles the CLI init command.
 */
export declare function handleInitCommand(options: CliOptions & {
    preset?: PolicyPreset;
    force?: boolean;
}, out?: (msg: string) => void, err?: (msg: string) => void): number;
//# sourceMappingURL=init.d.ts.map