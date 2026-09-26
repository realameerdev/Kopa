import { ConnectorMetadata } from '../types';
import { CONNECTORS_REGISTRY } from '../registry';
import { ExternalSyncPayload } from '../syncEngine';

export class SlackConnector {
  public static readonly metadata: ConnectorMetadata = CONNECTORS_REGISTRY.slack;

  public static getOAuthUrl(clientId: string, redirectUri: string, state: string): string {
    const userScopes = 'identity.basic,identity.email';
    const botScopes = 'chat:write,channels:read,incoming-webhook';
    const params = new URLSearchParams({
      client_id: clientId,
      scope: botScopes,
      user_scope: userScopes,
      redirect_uri: redirectUri,
      state,
    });
    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  public static async executeMcpTool(
    toolName: string,
    args: Record<string, any>,
    credentials: { accessToken?: string; defaultChannel?: string }
  ) {
    if (!credentials.accessToken) {
      throw new Error('Slack Bot Access Token (xoxb-...) is required.');
    }

    const channel = args.channel || credentials.defaultChannel || '#general';

    if (toolName === 'slack_post_alert' || toolName === 'slack_send_daily_digest') {
      const text = args.alertText || args.digestText || `Kopa Operations Digest for ${new Date().toLocaleDateString()}`;
      const level = args.level || 'info';
      const icon = level === 'critical' ? '🚨' : level === 'warning' ? '⚠️' : '📊';

      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channel.replace(/^#/, ''),
          text: `${icon} *Kopa Alert:* ${text}`,
        }),
      });

      if (!res.ok) {
        throw new Error(`Slack API error: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.ok) {
        throw new Error(`Slack error: ${data.error || 'Failed to post message'}`);
      }

      return {
        success: true,
        channel,
        ts: data.ts,
        summary: `Successfully posted notification to Slack channel ${channel}.`,
      };
    }

    throw new Error(`Unsupported MCP tool: ${toolName}`);
  }

  public static async fetchSyncData(_credentials: { accessToken?: string }): Promise<ExternalSyncPayload> {
    return {
      provider: 'slack',
    };
  }
}
