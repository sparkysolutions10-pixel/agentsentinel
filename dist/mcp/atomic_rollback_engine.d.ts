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
export interface FileSnapshot {
    path: string;
    existed: boolean;
    content: string | null;
}
export interface Checkpoint {
    id: string;
    name: string;
    createdAt: string;
    status: 'active' | 'committed' | 'rolled_back';
    snapshots: Map<string, FileSnapshot>;
}
export interface RollbackResult {
    checkpointId: string;
    restoredFiles: string[];
    deletedFiles: string[];
    success: boolean;
    timestamp: string;
}
export declare class AtomicRollbackEngine {
    private readonly checkpoints;
    /**
     * Initiates a new atomic transactional checkpoint before an agent starts an action.
     */
    beginCheckpoint(name: string, watchFiles?: string[]): Checkpoint;
    /**
     * Snapshots a specific file into an existing active checkpoint.
     */
    snapshotPath(checkpointOrId: Checkpoint | string, filePath: string): void;
    /**
     * Commits the checkpoint permanently when the agent's tasks succeed and tests pass.
     */
    commit(checkpointId: string): boolean;
    /**
     * Restores all modified/created files back to their exact state at checkpoint creation.
     */
    rollback(checkpointId: string): RollbackResult;
    getCheckpoint(id: string): Checkpoint | undefined;
    getActiveCheckpoints(): Checkpoint[];
    clear(): void;
}
//# sourceMappingURL=atomic_rollback_engine.d.ts.map