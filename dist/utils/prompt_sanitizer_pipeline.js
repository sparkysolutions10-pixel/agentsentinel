import { ZeroWidthSpaceScrubber } from './zero_width_space_scrubber.js';
import { InstructionOverrideDetector } from './instruction_override_detector.js';
import { SystemRoleSpoofGuard } from './system_role_spoof_guard.js';
export class PromptSanitizerPipeline {
    static evaluate(rawPrompt) {
        const flags = [];
        if (!rawPrompt || typeof rawPrompt !== 'string') {
            return { cleanText: '', isSafe: true, flags: [] };
        }
        let clean = ZeroWidthSpaceScrubber.scrub(rawPrompt);
        if (ZeroWidthSpaceScrubber.hasZeroWidth(rawPrompt)) {
            flags.push('ZERO_WIDTH_CHARS_DETECTED');
        }
        if (InstructionOverrideDetector.hasOverrideAttempt(clean)) {
            flags.push('INSTRUCTION_OVERRIDE_ATTEMPT');
        }
        if (SystemRoleSpoofGuard.isSpoofed(clean)) {
            flags.push('SYSTEM_ROLE_SPOOF_ATTEMPT');
        }
        return {
            cleanText: clean,
            isSafe: flags.length === 0,
            flags
        };
    }
}
//# sourceMappingURL=prompt_sanitizer_pipeline.js.map