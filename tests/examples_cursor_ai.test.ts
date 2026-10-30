import { describe, it, expect } from 'vitest';
import * as path from 'path';
import {
  createCursorAiSentinel,
  evaluateCursorAction,
} from '../examples/cursor_ai_guard.js';
import { Verdict } from '../src/types.js';

describe('Cursor AI Agent Security Walkthrough Test Suite (#191)', () => {
  const dummyWorkspace = path.resolve(__dirname, '../temp_cursor_test_ws');
  const engine = createCursorAiSentinel(dummyWorkspace);

  it('allows safe file editing operations inside the workspace root', async () => {
    const res = await evaluateCursorAction(engine, {
      tool: 'cursor_file_edit',
      filePath: path.join(dummyWorkspace, 'src/index.ts'),
      content: 'console.log("Hello Cursor");',
    });

    expect(res.allow).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });

  it('blocks Cursor agent attempts to modify .git/hooks directory', async () => {
    const res = await evaluateCursorAction(engine, {
      tool: 'cursor_file_edit',
      filePath: path.join(dummyWorkspace, '.git/hooks/pre-commit'),
      content: '#!/bin/sh\nexit 0',
    });

    expect(res.allow).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.warningOrError).toContain('Git Hook');
  });

  it('blocks Cursor agent attempts to escape workspace boundary', async () => {
    const res = await evaluateCursorAction(engine, {
      tool: 'cursor_file_edit',
      filePath: path.resolve(dummyWorkspace, '../../../../etc/hosts'),
      content: '127.0.0.1 malicious.local',
    });

    expect(res.allow).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks destructive terminal commands executed in Cursor terminal', async () => {
    const res = await evaluateCursorAction(engine, {
      tool: 'cursor_terminal',
      command: 'rm -rf / --no-preserve-root',
    });

    expect(res.allow).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.warningOrError).toContain('Recursive deletion');
  });

  it('blocks reading host private keys and sensitive system directories', async () => {
    const res = await evaluateCursorAction(engine, {
      tool: 'cursor_file_edit',
      filePath: '/etc/shadow',
      content: 'cat',
    });

    expect(res.allow).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
  });
});
