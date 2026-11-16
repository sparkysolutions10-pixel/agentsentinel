/**
 * AgentSentinel 1-Click Zero-Friction MCP Installer
 *
 * Automatically detects Claude Desktop & Cursor configuration directories across
 * Windows, macOS, and Linux. Safely merges the AgentSentinel Cloud Remote SSE endpoint
 * into existing mcpServers without touching other server configurations.
 *
 * @license MIT
 * @author Sparky Solutions (Mukesh Biswas)
 */
export interface InstallResult {
    success: boolean;
    targetPath: string;
    targetApp: string;
    backupPath?: string;
    error?: string;
}
export declare function getClaudeDesktopConfigPath(): string;
export declare function installToClaudeDesktop(apiKey?: string, remoteUrl?: string): InstallResult;
//# sourceMappingURL=installer.d.ts.map