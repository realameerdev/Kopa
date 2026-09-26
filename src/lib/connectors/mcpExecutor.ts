import { db } from '../db';
import { ConnectorProviderId, MCPExecutionRequest, MCPExecutionResult } from './types';
import { CONNECTORS_REGISTRY } from './registry';

export class MCPExecutor {
  /**
   * List all available tools across currently connected providers for the active business
   */
  public static getAvailableTools() {
    const connections = db.getConnectors().filter((c) => c.status === 'connected');
    const availableTools: Array<{
      provider: ConnectorProviderId;
      providerName: string;
      toolName: string;
      description: string;
      parameters: any[];
      readOnly: boolean;
    }> = [];

    for (const conn of connections) {
      const meta = CONNECTORS_REGISTRY[conn.provider];
      if (!meta) continue;

      for (const tool of meta.mcpTools) {
        // Check if required scopes were granted
        const hasScopes = tool.requiredScopes.every((s) => conn.grantedScopes.includes(s) || conn.grantedScopes.length === 0);
        if (hasScopes) {
          availableTools.push({
            provider: conn.provider,
            providerName: meta.name,
            toolName: tool.name,
            description: tool.description,
            parameters: tool.parameters,
            readOnly: tool.readOnly,
          });
        }
      }
    }

    return availableTools;
  }

  /**
   * Execute an MCP Tool via the secure backend proxy
   */
  public static async execute(request: MCPExecutionRequest): Promise<MCPExecutionResult> {
    const { provider, toolName, args } = request;
    const connection = db.getConnector(provider);

    if (!connection || connection.status !== 'connected') {
      return {
        success: false,
        provider,
        toolName,
        error: `Connector ${provider} is not connected or requires re-authentication.`,
      };
    }

    try {
      const res = await fetch('/api/connectors/mcp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          toolName,
          args,
          userId: db.getActiveUserId() || 'default_user',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          provider,
          toolName,
          error: errorData.error || `Server responded with status ${res.statusText}`,
        };
      }

      const result = await res.json();
      return result;
    } catch (err: any) {
      return {
        success: false,
        provider,
        toolName,
        error: err.message || 'Failed to communicate with MCP execution service.',
      };
    }
  }
}
