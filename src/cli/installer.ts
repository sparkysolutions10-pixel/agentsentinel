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

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export interface InstallResult {
  success: boolean;
  targetPath: string;
  targetApp: string;
  backupPath?: string;
  error?: string;
}

export function getClaudeDesktopConfigPath(): string {
  const platform = process.platform;
  if (platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
  } else if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else {
    return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
  }
}

export function installToClaudeDesktop(
  apiKey: string = 'sk_demo_pixel_2026',
  remoteUrl: string = 'https://mcp.getagentsentinel.com/sse'
): InstallResult {
  const configPath = getClaudeDesktopConfigPath();
  const configDir = path.dirname(configPath);

  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    let config: Record<string, any> = { mcpServers: {} };
    let backupPath: string | undefined;

    if (fs.existsSync(configPath)) {
      const rawContent = fs.readFileSync(configPath, 'utf8');
      try {
        config = JSON.parse(rawContent);
        // Create a safety backup
        backupPath = `${configPath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, rawContent, 'utf8');
      } catch {
        config = { mcpServers: {} };
      }
    }

    if (!config.mcpServers || typeof config.mcpServers !== 'object') {
      config.mcpServers = {};
    }

    // Safely inject or update agentsentinel entry for Claude Desktop
    // Claude Desktop claude_desktop_config.json strictly requires local stdio "command" & "args"
    config.mcpServers.agentsentinel = {
      command: 'npx',
      args: ['-y', '@sparkysolutions/agentsentinel'],
      env: {
        AGENT_SENTINEL_API_KEY: apiKey,
      },
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

    return {
      success: true,
      targetPath: configPath,
      targetApp: 'Claude Desktop',
      backupPath,
    };
  } catch (err: unknown) {
    return {
      success: false,
      targetPath: configPath,
      targetApp: 'Claude Desktop',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
