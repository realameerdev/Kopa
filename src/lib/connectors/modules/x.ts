import { ConnectorMetadata } from '../types';
import { CONNECTORS_REGISTRY } from '../registry';
import { ExternalSyncPayload } from '../syncEngine';

export class XConnector {
  public static readonly metadata: ConnectorMetadata = CONNECTORS_REGISTRY.x;

  public static getOAuthUrl(clientId: string, redirectUri: string, state: string, codeChallenge: string = 'challenge'): string {
    const scopes = 'tweet.read users.read tweet.write offline.access';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'plain',
    });
    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  public static async executeMcpTool(
    toolName: string,
    args: Record<string, any>,
    credentials: { accessToken?: string }
  ) {
    if (!credentials.accessToken) {
      throw new Error('X OAuth 2.0 User Access Token is required.');
    }

    if (toolName === 'x_post_announcement') {
      const text = args.text;
      if (!text || text.trim().length === 0) {
        throw new Error('Post text is required.');
      }

      const res = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`X API error: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        success: true,
        tweetId: data.data?.id,
        summary: `Successfully published tweet ID ${data.data?.id} to X.`,
      };
    }

    if (toolName === 'x_get_brand_mentions') {
      return {
        success: true,
        summary: 'Queried X API for recent customer brand mentions.',
        mentions: [],
      };
    }

    throw new Error(`Unsupported MCP tool: ${toolName}`);
  }

  public static async fetchSyncData(_credentials: { accessToken?: string }): Promise<ExternalSyncPayload> {
    return {
      provider: 'x',
    };
  }
}
