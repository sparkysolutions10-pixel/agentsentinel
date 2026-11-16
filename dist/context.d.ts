import { ToolCallContext, ToolCategory } from './types.js';
export declare const MAX_PARAM_PAYLOAD_BYTES: number;
/**
 * Infers appropriate ToolCategory from tool namespace or naming conventions.
 */
export declare function inferToolCategory(toolName: string): ToolCategory;
/**
 * Deeply sanitizes tool parameters against null bytes and circular references.
 */
export declare function sanitizeParams(rawParams: Record<string, any>, seen?: WeakSet<object>): Record<string, any>;
/**
 * Normalizes, validates, and seals arbitrary tool call payloads into a standard ToolCallContext.
 */
export declare function parseToolCallContext(raw: unknown): ToolCallContext;
//# sourceMappingURL=context.d.ts.map