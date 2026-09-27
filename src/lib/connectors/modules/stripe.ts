import { ConnectorMetadata } from '../types';
import { CONNECTORS_REGISTRY } from '../registry';
import { ExternalSyncPayload } from '../syncEngine';

export class StripeConnector {
  public static readonly metadata: ConnectorMetadata = CONNECTORS_REGISTRY.stripe;

  public static validateKey(key: string): boolean {
    return Boolean(key && (key.startsWith('sk_') || key.startsWith('rk_')));
  }

  public static async executeMcpTool(
    toolName: string,
    args: Record<string, any>,
    credentials: { secretKey?: string }
  ) {
    if (!credentials.secretKey || !this.validateKey(credentials.secretKey)) {
      throw new Error('Valid Stripe secret key (sk_... or rk_...) is required.');
    }

    if (toolName === 'stripe_get_balance') {
      const res = await fetch('https://api.stripe.com/v1/balance', {
        headers: {
          Authorization: `Bearer ${credentials.secretKey}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Stripe API error: ${res.statusText}`);
      }

      const data = await res.json();
      const available = data.available?.map((b: any) => `${b.currency.toUpperCase()} ${(b.amount / 100).toFixed(2)}`).join(', ') || '0.00';
      const pending = data.pending?.map((b: any) => `${b.currency.toUpperCase()} ${(b.amount / 100).toFixed(2)}`).join(', ') || '0.00';

      return {
        success: true,
        availableBalance: available,
        pendingBalance: pending,
        summary: `Current Stripe Balance: Available ${available}, Pending ${pending}.`,
      };
    }

    if (toolName === 'stripe_read_payments') {
      const limit = Math.min(args.limit || 20, 50);
      const res = await fetch(`https://api.stripe.com/v1/charges?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${credentials.secretKey}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Stripe API error: ${res.statusText}`);
      }

      const data = await res.json();
      const charges = (data.data || []).map((c: any) => ({
        id: c.id,
        amount: c.amount / 100,
        currency: c.currency.toUpperCase(),
        paid: c.paid,
        status: c.status,
        description: c.description || 'Stripe Charge',
        customerEmail: c.billing_details?.email || c.receipt_email,
        customerName: c.billing_details?.name || 'Cardholder',
        created: new Date(c.created * 1000).toISOString(),
      }));

      return {
        success: true,
        count: charges.length,
        charges,
        summary: `Retrieved ${charges.length} Stripe transaction(s).`,
      };
    }

    throw new Error(`Unsupported MCP tool: ${toolName}`);
  }

  public static async fetchSyncData(credentials: { secretKey?: string }): Promise<ExternalSyncPayload> {
    if (!credentials.secretKey || !this.validateKey(credentials.secretKey)) {
      throw new Error('Valid Stripe secret key is required.');
    }

    const res = await fetch('https://api.stripe.com/v1/charges?limit=50', {
      headers: { Authorization: `Bearer ${credentials.secretKey}` },
    });

    if (!res.ok) {
      throw new Error(`Stripe API error (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    const payments = (data.data || []).map((c: any) => ({
      externalId: c.id,
      title: c.description ? `Stripe: ${c.description}` : `Stripe Payment (${c.id.substring(0, 10)})`,
      amount: c.amount / 100,
      customerName: c.billing_details?.name || 'Stripe Cardholder',
      customerEmail: c.billing_details?.email || c.receipt_email,
      date: new Date(c.created * 1000).toISOString(),
      status: (c.status === 'succeeded' ? 'completed' : c.status === 'failed' ? 'cancelled' : 'pending') as 'completed' | 'pending' | 'cancelled',
      notes: `Card: ${c.payment_method_details?.card?.brand || 'Card'} •••• ${c.payment_method_details?.card?.last4 || '****'}, Receipt: ${c.receipt_url || 'N/A'}`,
    }));

    return {
      provider: 'stripe',
      payments,
    };
  }
}
