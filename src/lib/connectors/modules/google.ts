import { ConnectorMetadata } from '../types';
import { CONNECTORS_REGISTRY } from '../registry';
import { ExternalSyncPayload } from '../syncEngine';

export class GoogleConnector {
  public static readonly metadata: ConnectorMetadata = CONNECTORS_REGISTRY.google;

  public static getOAuthUrl(clientId: string, redirectUri: string, state: string): string {
    const scopes = GoogleConnector.metadata.scopes.map((s) => s.id).join(' ');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public static async executeMcpTool(
    toolName: string,
    args: Record<string, any>,
    credentials: { accessToken?: string }
  ) {
    if (!credentials.accessToken) {
      throw new Error('Google OAuth Access Token is required.');
    }

    if (toolName === 'google_read_sheet_data') {
      const { spreadsheetId, range } = args;
      if (!spreadsheetId || !range) {
        throw new Error('Spreadsheet ID and Range are required.');
      }

      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
      });

      if (!res.ok) {
        throw new Error(`Google Sheets API error: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        success: true,
        values: data.values || [],
        summary: `Retrieved ${(data.values || []).length} rows from Google Sheet range ${range}.`,
      };
    }

    if (toolName === 'google_export_to_sheets') {
      const { sheetTitle } = args;
      // Create new spreadsheet
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `Kopa Export - ${sheetTitle || 'Financial Report'} (${new Date().toLocaleDateString()})`,
          },
        }),
      });

      if (!createRes.ok) {
        throw new Error(`Failed to create Google Sheet: ${createRes.statusText}`);
      }

      const createdData = await createRes.json();
      return {
        success: true,
        spreadsheetId: createdData.spreadsheetId,
        spreadsheetUrl: createdData.spreadsheetUrl,
        summary: `Created Google Spreadsheet: ${createdData.properties?.title}. View at ${createdData.spreadsheetUrl}`,
      };
    }

    throw new Error(`Unsupported MCP tool: ${toolName}`);
  }

  public static async fetchSyncData(_credentials: { accessToken?: string }): Promise<ExternalSyncPayload> {
    return {
      provider: 'google',
    };
  }
}
