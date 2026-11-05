import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AtomicRollbackEngine } from '../src/mcp/atomic_rollback_engine.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('AtomicRollbackEngine', () => {
  let engine: AtomicRollbackEngine;
  let tempDir: string;

  beforeEach(() => {
    engine = new AtomicRollbackEngine();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sentinel-rollback-test-'));
  });

  afterEach(() => {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch {
      // ignore cleanup errors
    }
  });

  it('should restore modified files to their original content on rollback', () => {
    const filePath = path.join(tempDir, 'config.json');
    fs.writeFileSync(filePath, JSON.stringify({ version: '1.0.0', secure: true }), 'utf8');

    const checkpoint = engine.beginCheckpoint('pre-deploy', [filePath]);
    expect(checkpoint.status).toBe('active');

    // Agent modifies the file
    fs.writeFileSync(filePath, JSON.stringify({ version: '2.0.0-broken', secure: false }), 'utf8');

    // Rollback
    const result = engine.rollback(checkpoint.id);
    expect(result.success).toBe(true);
    expect(result.restoredFiles.length).toBe(1);

    const restoredContent = fs.readFileSync(filePath, 'utf8');
    expect(JSON.parse(restoredContent)).toEqual({ version: '1.0.0', secure: true });
    expect(checkpoint.status).toBe('rolled_back');
  });

  it('should delete newly created files on rollback if they did not exist at checkpoint time', () => {
    const newFilePath = path.join(tempDir, 'malicious_script.sh');
    expect(fs.existsSync(newFilePath)).toBe(false);

    const checkpoint = engine.beginCheckpoint('file-creation-guard', [newFilePath]);

    // Agent creates the file
    fs.writeFileSync(newFilePath, '#!/bin/bash\nrm -rf /', 'utf8');
    expect(fs.existsSync(newFilePath)).toBe(true);

    // Rollback
    const result = engine.rollback(checkpoint.id);
    expect(result.success).toBe(true);
    expect(result.deletedFiles.length).toBe(1);
    expect(fs.existsSync(newFilePath)).toBe(false);
  });

  it('should commit successfully and prevent rollback after commit', () => {
    const filePath = path.join(tempDir, 'state.txt');
    fs.writeFileSync(filePath, 'initial', 'utf8');

    const checkpoint = engine.beginCheckpoint('commit-test', [filePath]);
    fs.writeFileSync(filePath, 'final-approved-state', 'utf8');

    const committed = engine.commit(checkpoint.id);
    expect(committed).toBe(true);
    expect(checkpoint.status).toBe('committed');

    // Attempting rollback on committed checkpoint throws error
    expect(() => engine.rollback(checkpoint.id)).toThrow(/already committed/);
    expect(fs.readFileSync(filePath, 'utf8')).toBe('final-approved-state');
  });

  it('should handle multi-file atomic transactions', () => {
    const file1 = path.join(tempDir, 'file1.txt');
    const file2 = path.join(tempDir, 'file2.txt');
    const file3 = path.join(tempDir, 'file3.txt');

    fs.writeFileSync(file1, 'original-1', 'utf8');
    fs.writeFileSync(file2, 'original-2', 'utf8');
    // file3 does not exist initially

    const checkpoint = engine.beginCheckpoint('multi-file', [file1, file2, file3]);

    // Modify file1, modify file2, create file3
    fs.writeFileSync(file1, 'modified-1', 'utf8');
    fs.writeFileSync(file2, 'modified-2', 'utf8');
    fs.writeFileSync(file3, 'created-3', 'utf8');

    const result = engine.rollback(checkpoint.id);
    expect(result.restoredFiles.length).toBe(2);
    expect(result.deletedFiles.length).toBe(1);

    expect(fs.readFileSync(file1, 'utf8')).toBe('original-1');
    expect(fs.readFileSync(file2, 'utf8')).toBe('original-2');
    expect(fs.existsSync(file3)).toBe(false);
  });
});
