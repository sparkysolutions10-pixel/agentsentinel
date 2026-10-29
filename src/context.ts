import { randomUUID } from 'node:crypto';
import { ToolCallContext, ToolCategory } from './types.js';

/**
 * Infers appropriate ToolCategory from tool namespace or naming conventions.
 */
export function inferToolCategory(toolName: string): ToolCategory {
  const lower = toolName.toLowerCase();

  // 1. Explicit namespace prefixes take absolute precedence
  if (lower.startsWith('shell:') || lower.startsWith('bash:') || lower.startsWith('cmd:') || lower.startsWith('sh:')) {
    return 'shell';
  }
  if (lower.startsWith('sql:') || lower.startsWith('db:') || lower.startsWith('postgres:') || lower.startsWith('mysql:') || lower.startsWith('sqlite:')) {
    return 'sql';
  }
  if (lower.startsWith('fs:') || lower.startsWith('file:') || lower.startsWith('dir:')) {
    return 'fs';
  }
  if (lower.startsWith('secret:') || lower.startsWith('auth:') || lower.startsWith('vault:')) {
    return 'secrets';
  }
  if (lower.startsWith('http:') || lower.startsWith('https:') || lower.startsWith('net:') || lower.startsWith('network:')) {
    return 'network';
  }

  // 2. Keyword fallback matching
  if (lower.includes('query') || lower.includes('postgres') || lower.includes('mysql') || lower.includes('sqlite')) {
    return 'sql';
  }
  if (lower.includes('read_file') || lower.includes('write_file') || lower.includes('file') || lower.includes('directory')) {
    return 'fs';
  }
  if (lower.includes('secret') || lower.includes('password') || lower.includes('token') || lower.includes('auth')) {
    return 'secrets';
  }
  if (lower.includes('terminal') || lower.includes('command') || lower.includes('bash') || lower.includes('exec')) {
    return 'shell';
  }
  if (lower.includes('fetch') || lower.includes('curl') || lower.includes('api') || lower.includes('http')) {
    return 'network';
  }
  return 'custom';
}

/**
 * Normalizes, validates, and seals arbitrary tool call payloads into a standard ToolCallContext.
 */
export function parseToolCallContext(raw: unknown): ToolCallContext {
  if (!raw || typeof raw !== 'object') {
    throw new TypeError('[AgentSentinel] Invalid tool call payload: Expected an object.');
  }

  const obj = raw as Record<string, any>;
  const toolName = typeof obj.toolName === 'string' ? obj.toolName.trim() : (typeof obj.name === 'string' ? obj.name.trim() : '');

  if (!toolName) {
    throw new TypeError('[AgentSentinel] Missing required "toolName" field in tool call payload.');
  }

  const id = typeof obj.id === 'string' && obj.id.trim().length > 0 ? obj.id.trim() : randomUUID();
  const agentId = typeof obj.agentId === 'string' ? obj.agentId.trim() : undefined;
  const category = (obj.category && typeof obj.category === 'string') ? (obj.category as ToolCategory) : inferToolCategory(toolName);
  const params = (obj.params && typeof obj.params === 'object' && !Array.isArray(obj.params)) ? { ...obj.params } : (obj.arguments && typeof obj.arguments === 'object' && !Array.isArray(obj.arguments) ? { ...obj.arguments } : {});
  const timestamp = typeof obj.timestamp === 'number' && Number.isFinite(obj.timestamp) ? obj.timestamp : Date.now();

  const context: ToolCallContext = {
    id,
    agentId,
    toolName,
    category,
    params,
    timestamp
  };

  return Object.freeze(context);
}
