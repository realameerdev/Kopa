import { ConnectorMetadata } from '../types';
import { CONNECTORS_REGISTRY } from '../registry';
import { ExternalSyncPayload } from '../syncEngine';

export class InstagramConnector {
  public static readonly metadata: ConnectorMetadata = CONNECTORS_REGISTRY.instagram;

  public static getOAuthUrl(clientId: string, redirectUri: string, state: string): string {
    const scopes = 'instagram_basic,instagram_manage_messages,pages_show_list';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: 'code',
      state,
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  public static async executeMcpTool(
    toolName: string,
    args: Record<string, any>,
    credentials: { accessToken?: string; igUserId?: string }
  ) {
    if (!credentials.accessToken) {
      throw new Error('Instagram Graph API Access Token is required.');
    }

    if (toolName === 'instagram_get_inquiries') {
      const igId = credentials.igUserId || 'me';
      const res = await fetch(`https://graph.facebook.com/v19.0/${igId}/conversations?platform=instagram`, {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
      });

      if (!res.ok) {
        throw new Error(`Instagram API error: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        success: true,
        conversationsCount: (data.data || []).length,
        summary: `Retrieved ${(data.data || []).length} customer DM inquiry threads from Instagram.`,
      };
    }

    throw new Error(`Unsupported MCP tool: ${toolName}`);
  }

  public static async fetchSyncData(_credentials: { accessToken?: string }): Promise<ExternalSyncPayload> {
    return {
      provider: 'instagram',
    };
  }
}
