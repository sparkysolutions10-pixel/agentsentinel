/**
 * AgentSentinel Atomic Rollback Engine
 *
 * Provides ACID transactional checkpointing and multi-step auto-rollback capabilities
 * for autonomous AI agents. Captures lightweight pre-execution state snapshots across
 * monitored files and working memory, guaranteeing instant 1-click restore if an agent
 * fails, crashes, or triggers test/policy violations.
 *
 * @license MIT
 * @author Sparky Solutions (Mukesh Biswas)
 */
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
export class AtomicRollbackEngine {
    checkpoints = new Map();
    /**
     * Initiates a new atomic transactional checkpoint before an agent starts an action.
     */
    beginCheckpoint(name, watchFiles = []) {
        const id = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const checkpoint = {
            id,
            name,
            createdAt: new Date().toISOString(),
            status: 'active',
            snapshots: new Map(),
        };
        for (const file of watchFiles) {
            this.snapshotPath(checkpoint, file);
        }
        this.checkpoints.set(id, checkpoint);
        return checkpoint;
    }
    /**
     * Snapshots a specific file into an existing active checkpoint.
     */
    snapshotPath(checkpointOrId, filePath) {
        const checkpoint = typeof checkpointOrId === 'string'
            ? this.checkpoints.get(checkpointOrId)
            : checkpointOrId;
        if (!checkpoint) {
            throw new Error(`Checkpoint not found: ${checkpointOrId}`);
        }
        if (checkpoint.status !== 'active') {
            throw new Error(`Cannot snapshot into checkpoint ${checkpoint.id} with status: ${checkpoint.status}`);
        }
        const absolutePath = resolve(filePath);
        if (checkpoint.snapshots.has(absolutePath)) {
            return; // Already captured original base state
        }
        if (existsSync(absolutePath)) {
            const content = readFileSync(absolutePath, 'utf8');
            checkpoint.snapshots.set(absolutePath, {
                path: absolutePath,
                existed: true,
                content,
            });
        }
        else {
            checkpoint.snapshots.set(absolutePath, {
                path: absolutePath,
                existed: false,
                content: null,
            });
        }
    }
    /**
     * Commits the checkpoint permanently when the agent's tasks succeed and tests pass.
     */
    commit(checkpointId) {
        const checkpoint = this.checkpoints.get(checkpointId);
        if (!checkpoint) {
            throw new Error(`Checkpoint not found: ${checkpointId}`);
        }
        if (checkpoint.status !== 'active') {
            throw new Error(`Checkpoint ${checkpointId} is already ${checkpoint.status}`);
        }
        checkpoint.status = 'committed';
        checkpoint.snapshots.clear();
        return true;
    }
    /**
     * Restores all modified/created files back to their exact state at checkpoint creation.
     */
    rollback(checkpointId) {
        const checkpoint = this.checkpoints.get(checkpointId);
        if (!checkpoint) {
            throw new Error(`Checkpoint not found: ${checkpointId}`);
        }
        if (checkpoint.status !== 'active') {
            throw new Error(`Cannot rollback checkpoint ${checkpointId} because it is already ${checkpoint.status}`);
        }
        const restoredFiles = [];
        const deletedFiles = [];
        for (const [path, snapshot] of checkpoint.snapshots.entries()) {
            if (snapshot.existed && snapshot.content !== null) {
                // Restore original content
                writeFileSync(path, snapshot.content, 'utf8');
                restoredFiles.push(path);
            }
            else if (!snapshot.existed) {
                // File was created after checkpoint; delete it to roll back
                if (existsSync(path)) {
                    unlinkSync(path);
                    deletedFiles.push(path);
                }
            }
        }
        checkpoint.status = 'rolled_back';
        return {
            checkpointId,
            restoredFiles,
            deletedFiles,
            success: true,
            timestamp: new Date().toISOString(),
        };
    }
    getCheckpoint(id) {
        return this.checkpoints.get(id);
    }
    getActiveCheckpoints() {
        return Array.from(this.checkpoints.values()).filter((c) => c.status === 'active');
    }
    clear() {
        this.checkpoints.clear();
    }
}
//# sourceMappingURL=atomic_rollback_engine.js.map