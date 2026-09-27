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

    // 1. Google Sheets: Read Data
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

    // 2. Google Sheets: Export to Sheets
    if (toolName === 'google_export_to_sheets') {
      const { sheetTitle } = args;
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

    // 3. Google Drive: List Files
    if (toolName === 'google_drive_list_files') {
      const pageSize = args.pageSize || 15;
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=nextPageToken,files(id,name,mimeType,modifiedTime,size,webViewLink)`,
        {
          headers: { Authorization: `Bearer ${credentials.accessToken}` },
        }
      );

      if (!res.ok) {
        throw new Error(`Google Drive API error: ${res.statusText}`);
      }

      const data = await res.json();
      const files = data.files || [];
      return {
        success: true,
        files,
        summary: `Found ${files.length} file(s) in connected Google Drive.`,
        data: files,
      };
    }

    // 4. Google Drive: Backup Ledger
    if (toolName === 'google_drive_backup_ledger') {
      const { filename = `kopa_business_ledger_backup_${Date.now()}.json`, ledgerData } = args;
      const fileContent = typeof ledgerData === 'string' ? ledgerData : JSON.stringify(ledgerData || {}, null, 2);

      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const metadata = {
        name: filename,
        mimeType: 'application/json',
        description: 'Automated Kopa Business Ledger Backup',
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        closeDelim;

      const uploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );

      if (!uploadRes.ok) {
        throw new Error(`Google Drive upload error: ${uploadRes.statusText}`);
      }

      const uploadData = await uploadRes.json();
      return {
        success: true,
        fileId: uploadData.id,
        fileName: uploadData.name,
        webViewLink: uploadData.webViewLink,
        summary: `Successfully backed up Kopa ledger to Google Drive file "${uploadData.name}".`,
        data: uploadData,
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
