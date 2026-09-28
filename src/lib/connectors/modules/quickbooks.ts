import { ConnectorMetadata } from '../types';
import { CONNECTORS_REGISTRY } from '../registry';
import { ExternalSyncPayload } from '../syncEngine';

export class QuickBooksConnector {
  public static readonly metadata: ConnectorMetadata = CONNECTORS_REGISTRY.quickbooks;

  public static getOAuthUrl(clientId: string, redirectUri: string, state: string): string {
    const scopes = 'com.intuit.quickbooks.accounting openid profile email';
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      scope: scopes,
      redirect_uri: redirectUri,
      state,
    });
    return `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;
  }

  public static async executeMcpTool(
    toolName: string,
    args: Record<string, any>,
    credentials: { accessToken?: string; realmId?: string }
  ) {
    if (!credentials.accessToken || !credentials.realmId) {
      throw new Error('QuickBooks Access Token and Realm/Company ID are required.');
    }

    const host = 'https://quickbooks.api.intuit.com';

    if (toolName === 'quickbooks_read_invoices') {
      const query = "select * from Invoice maxresults 20";
      const res = await fetch(`${host}/v3/company/${credentials.realmId}/query?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`QuickBooks API error: ${res.statusText}`);
      }

      const data = await res.json();
      const invoices = (data.QueryResponse?.Invoice || []).map((inv: any) => ({
        id: inv.Id,
        docNumber: inv.DocNumber,
        totalAmt: Number(inv.TotalAmt),
        balance: Number(inv.Balance),
        customerName: inv.CustomerRef?.name,
        dueDate: inv.DueDate,
      }));

      return {
        success: true,
        count: invoices.length,
        invoices,
        summary: `Retrieved ${invoices.length} invoices from QuickBooks.`,
      };
    }

    if (toolName === 'quickbooks_sync_expenses') {
      const query = "select * from Purchase maxresults 30";
      const res = await fetch(`${host}/v3/company/${credentials.realmId}/query?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`QuickBooks API error: ${res.statusText}`);
      }

      const data = await res.json();
      const expenses = (data.QueryResponse?.Purchase || []).map((p: any) => ({
        id: p.Id,
        amount: Number(p.TotalAmt),
        paymentType: p.PaymentType,
        accountRef: p.AccountRef?.name,
        txnDate: p.TxnDate,
      }));

      return {
        success: true,
        count: expenses.length,
        expenses,
        summary: `Imported ${expenses.length} expense items from QuickBooks Company Ledger.`,
      };
    }

    throw new Error(`Unsupported MCP tool: ${toolName}`);
  }

  public static async fetchSyncData(credentials: { accessToken?: string; realmId?: string; clientId?: string; clientSecret?: string }): Promise<ExternalSyncPayload> {
    const token = credentials.accessToken || credentials.clientSecret || process.env.QUICKBOOKS_CLIENT_SECRET;
    const realmId = credentials.realmId || process.env.QUICKBOOKS_REALM_ID;

    let expenses: any[] = [];

    if (token && realmId) {
      try {
        const host = 'https://quickbooks.api.intuit.com';
        const res = await fetch(`${host}/v3/company/${realmId}/query?query=${encodeURIComponent("select * from Purchase maxresults 50")}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          expenses = (data.QueryResponse?.Purchase || []).map((p: any) => ({
            externalId: String(p.Id),
            category: p.AccountRef?.name || 'General Expense',
            description: `QuickBooks Expense: ${p.EntityRef?.name || p.PaymentType || 'Vendor Payment'}`,
            amount: Number(p.TotalAmt || 0),
            date: p.TxnDate || new Date().toISOString(),
            isRecurring: false,
          }));
        }
      } catch (err) {
        console.warn('QuickBooks sync notice:', err);
      }
    }

    return {
      provider: 'quickbooks',
      expenses,
    };
  }
}
