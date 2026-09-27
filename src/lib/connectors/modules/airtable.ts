import { ConnectorMetadata } from '../types';
import { CONNECTORS_REGISTRY } from '../registry';
import { ExternalSyncPayload } from '../syncEngine';

export class AirtableConnector {
  public static readonly metadata: ConnectorMetadata = CONNECTORS_REGISTRY.airtable;

  public static async executeMcpTool(
    toolName: string,
    args: Record<string, any>,
    credentials: { clientId?: string; baseId?: string; tableName?: string }
  ) {
    const token = credentials.clientId;
    const baseId = credentials.baseId;
    const tableName = credentials.tableName || 'Products';

    if (!token || !baseId) {
      throw new Error('Airtable Access Token / PAT and Base ID are required.');
    }

    if (toolName === 'airtable_fetch_records' || toolName === 'airtable_sync_catalog') {
      const maxRecords = Math.min(args.maxRecords || 50, 100);
      const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=${maxRecords}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Airtable API error: ${res.statusText}`);
      }

      const data = await res.json();
      const records = (data.records || []).map((r: any) => ({
        id: r.id,
        fields: r.fields,
        createdTime: r.createdTime,
      }));

      return {
        success: true,
        count: records.length,
        records,
        summary: `Retrieved ${records.length} records from Airtable Base ${baseId} (${tableName}).`,
      };
    }

    throw new Error(`Unsupported MCP tool: ${toolName}`);
  }

  public static async fetchSyncData(credentials: { clientId?: string; baseId?: string; tableName?: string }): Promise<ExternalSyncPayload> {
    const token = credentials.clientId;
    const baseId = credentials.baseId;
    const tableName = credentials.tableName || 'Products';

    if (!token || !baseId) {
      throw new Error('Airtable Access Token and Base ID are required.');
    }

    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Airtable Sync error: ${res.statusText}`);
    }

    const data = await res.json();
    const products = (data.records || []).map((r: any) => {
      const f = r.fields || {};
      const name = f.Name || f.Title || f['Product Name'] || f.Item || `Airtable Item ${r.id.substring(0, 6)}`;
      const price = Number(f.Price || f['Selling Price'] || f.Cost || 0);
      const stock = Number(f.Stock || f.Quantity || f['Units Available'] || 1);
      const cost = f['Cost Price'] ? Number(f['Cost Price']) : null;

      return {
        externalId: r.id,
        name: String(name),
        category: String(f.Category || 'Airtable Inventory'),
        sellingPrice: price,
        costPrice: cost,
        stock,
      };
    });

    return {
      provider: 'airtable',
      products,
    };
  }
}
