import { ConnectorMetadata } from '../types';
import { CONNECTORS_REGISTRY } from '../registry';
import { ExternalSyncPayload } from '../syncEngine';

export class PayPalConnector {
  public static readonly metadata: ConnectorMetadata = CONNECTORS_REGISTRY.paypal;

  public static async getAccessToken(clientId: string, clientSecret: string, environment: string = 'live'): Promise<string> {
    const host = environment === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    const auth = btoa(`${clientId}:${clientSecret}`);

    const res = await fetch(`${host}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      throw new Error(`PayPal Authentication failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.access_token;
  }

  public static async executeMcpTool(
    toolName: string,
    args: Record<string, any>,
    credentials: { clientId?: string; clientSecret?: string; environment?: string }
  ) {
    if (!credentials.clientId || !credentials.clientSecret) {
      throw new Error('PayPal Client ID and Secret are required.');
    }

    const token = await this.getAccessToken(credentials.clientId, credentials.clientSecret, credentials.environment);
    const host = credentials.environment === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

    if (toolName === 'paypal_read_transactions') {
      const daysBack = args.daysBack || 30;
      const startDate = new Date(Date.now() - daysBack * 86400000).toISOString();
      const endDate = new Date().toISOString();

      const res = await fetch(`${host}/v1/reporting/transactions?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&fields=transaction_info,payer_info`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`PayPal reporting error: ${res.statusText}`);
      }

      const data = await res.json();
      const txs = (data.transaction_details || []).map((t: any) => ({
        id: t.transaction_info?.transaction_id,
        status: t.transaction_info?.transaction_status,
        amount: Number(t.transaction_info?.transaction_amount?.value || 0),
        currency: t.transaction_info?.transaction_amount?.currency_code,
        payerEmail: t.payer_info?.email_address,
        payerName: t.payer_info?.payer_name?.alternate_full_name,
        date: t.transaction_info?.transaction_initiation_date,
      }));

      return {
        success: true,
        count: txs.length,
        transactions: txs,
        summary: `Retrieved ${txs.length} PayPal transactions from past ${daysBack} days.`,
      };
    }

    throw new Error(`Unsupported MCP tool: ${toolName}`);
  }

  public static async fetchSyncData(credentials: { clientId?: string; clientSecret?: string; environment?: string }): Promise<ExternalSyncPayload> {
    if (!credentials.clientId || !credentials.clientSecret) {
      throw new Error('PayPal Client ID and Secret are required.');
    }
    const token = await this.getAccessToken(credentials.clientId, credentials.clientSecret, credentials.environment);
    const host = credentials.environment === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

    const startDate = new Date(Date.now() - 30 * 86400000).toISOString();
    const endDate = new Date().toISOString();

    const res = await fetch(`${host}/v1/reporting/transactions?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&fields=transaction_info,payer_info`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`PayPal Sync API error: ${res.statusText}`);
    }

    const data = await res.json();
    const payments = (data.transaction_details || []).map((t: any) => ({
      externalId: t.transaction_info?.transaction_id || `pp-${Date.now()}`,
      title: `PayPal: ${t.transaction_info?.transaction_subject || 'Buyer Payment'}`,
      amount: Math.abs(Number(t.transaction_info?.transaction_amount?.value || 0)),
      customerName: t.payer_info?.payer_name?.alternate_full_name || 'PayPal Buyer',
      customerEmail: t.payer_info?.email_address,
      date: t.transaction_info?.transaction_initiation_date || new Date().toISOString(),
      status: (t.transaction_info?.transaction_status === 'S' ? 'completed' : t.transaction_info?.transaction_status === 'D' ? 'cancelled' : 'pending') as 'completed' | 'pending' | 'cancelled',
      notes: `PayPal Fee: ${t.transaction_info?.fee_amount?.value || '0'} ${t.transaction_info?.fee_amount?.currency_code || ''}`,
    }));

    return {
      provider: 'paypal',
      payments,
    };
  }
}
