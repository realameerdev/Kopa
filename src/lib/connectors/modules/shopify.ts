import { ConnectorMetadata } from '../types';
import { CONNECTORS_REGISTRY } from '../registry';
import { ExternalSyncPayload } from '../syncEngine';

export class ShopifyConnector {
  public static readonly metadata: ConnectorMetadata = CONNECTORS_REGISTRY.shopify;

  public static getOAuthUrl(storeDomain: string, clientId: string, redirectUri: string, state: string): string {
    let cleanDomain = (storeDomain || '').trim();
    if (cleanDomain.includes('admin.shopify.com/store/')) {
      const parts = cleanDomain.split('admin.shopify.com/store/');
      const storeSlug = parts[1]?.split('/')[0]?.split('?')[0];
      if (storeSlug) cleanDomain = `${storeSlug}.myshopify.com`;
    } else {
      cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
      if (cleanDomain && !cleanDomain.includes('.')) {
        cleanDomain = `${cleanDomain}.myshopify.com`;
      }
    }
    const scopes = ShopifyConnector.metadata.scopes.map((s) => s.id).join(',');
    const params = new URLSearchParams({
      client_id: (clientId || '').trim(),
      scope: scopes,
      redirect_uri: redirectUri,
      state,
      'grant_options[]': 'per-user',
    });
    return `https://${cleanDomain}/admin/oauth/authorize?${params.toString()}`;
  }

  public static async executeMcpTool(
    toolName: string,
    args: Record<string, any>,
    credentials: { storeDomain?: string; accessToken?: string }
  ) {
    if (!credentials.accessToken || !credentials.storeDomain) {
      throw new Error('Shopify store domain and access token are required.');
    }

    const domain = credentials.storeDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();

    if (toolName === 'shopify_read_orders') {
      const limit = Math.min(args.limit || 20, 50);
      const status = args.status || 'any';
      const endpoint = `https://${domain}/admin/api/2024-01/orders.json?limit=${limit}&status=${status}`;

      const res = await fetch(endpoint, {
        headers: {
          'X-Shopify-Access-Token': credentials.accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Shopify API error (${res.status}): ${res.statusText}`);
      }

      const data = await res.json();
      const orders = (data.orders || []).map((o: any) => ({
        id: String(o.id),
        orderNumber: o.name || `#${o.order_number}`,
        totalPrice: Number(o.total_price),
        currency: o.currency,
        financialStatus: o.financial_status,
        fulfillmentStatus: o.fulfillment_status || 'unfulfilled',
        createdAt: o.created_at,
        customerName: o.customer ? `${o.customer.first_name || ''} ${o.customer.last_name || ''}`.trim() : 'Guest',
        itemsCount: o.line_items ? o.line_items.length : 0,
      }));

      return {
        success: true,
        count: orders.length,
        orders,
        summary: `Retrieved ${orders.length} order(s) from Shopify store ${domain}.`,
      };
    }

    if (toolName === 'shopify_read_products') {
      const endpoint = `https://${domain}/admin/api/2024-01/products.json?limit=50`;
      const res = await fetch(endpoint, {
        headers: {
          'X-Shopify-Access-Token': credentials.accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Shopify API error: ${res.statusText}`);
      }

      const data = await res.json();
      const products = (data.products || []).map((p: any) => ({
        id: String(p.id),
        title: p.title,
        productType: p.product_type || 'General',
        vendor: p.vendor,
        price: p.variants?.[0]?.price ? Number(p.variants[0].price) : 0,
        inventory: p.variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 0,
      }));

      return {
        success: true,
        count: products.length,
        products,
        summary: `Found ${products.length} product(s) in Shopify store inventory.`,
      };
    }

    throw new Error(`Unsupported MCP tool: ${toolName}`);
  }

  public static async fetchSyncData(credentials: { storeDomain?: string; accessToken?: string; clientSecret?: string }): Promise<ExternalSyncPayload> {
    const rawDomain = credentials.storeDomain || process.env.SHOPIFY_STORE_DOMAIN || '';
    const token = credentials.accessToken || credentials.clientSecret || process.env.SHOPIFY_CLIENT_SECRET;

    if (!rawDomain) {
      throw new Error('Shopify store domain is required.');
    }

    let domain = rawDomain.trim();
    if (domain.includes('admin.shopify.com/store/')) {
      const parts = domain.split('admin.shopify.com/store/');
      const storeSlug = parts[1]?.split('/')[0]?.split('?')[0];
      if (storeSlug) domain = `${storeSlug}.myshopify.com`;
    } else {
      domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
      if (!domain.includes('.')) {
        domain = `${domain}.myshopify.com`;
      }
    }

    let mappedOrders: any[] = [];
    let mappedProducts: any[] = [];

    if (token) {
      try {
        // 1. Fetch Orders
        const ordersRes = await fetch(`https://${domain}/admin/api/2024-01/orders.json?limit=50&status=any`, {
          headers: { 'X-Shopify-Access-Token': token },
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          mappedOrders = (ordersData.orders || []).map((o: any) => ({
            externalId: String(o.id),
            title: `Shopify Order ${o.name || '#' + o.order_number}`,
            amount: Number(o.total_price || 0),
            customerName: o.customer ? `${o.customer.first_name || ''} ${o.customer.last_name || ''}`.trim() : undefined,
            customerEmail: o.email || o.customer?.email,
            customerPhone: o.phone || o.customer?.phone,
            date: o.created_at,
            status: (o.financial_status === 'paid' ? 'completed' : o.financial_status === 'voided' ? 'cancelled' : 'pending') as 'completed' | 'pending' | 'cancelled',
            notes: `Order items: ${(o.line_items || []).map((li: any) => `${li.quantity}x ${li.title}`).join(', ')}`,
          }));
        }

        // 2. Fetch Products
        const productsRes = await fetch(`https://${domain}/admin/api/2024-01/products.json?limit=50`, {
          headers: { 'X-Shopify-Access-Token': token },
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          mappedProducts = (productsData.products || []).map((p: any) => ({
            externalId: String(p.id),
            name: p.title,
            category: p.product_type || 'Shopify Inventory',
            sellingPrice: p.variants?.[0]?.price ? Number(p.variants[0].price) : 0,
            costPrice: null,
            stock: p.variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 0,
          }));
        }
      } catch (err) {
        console.warn('Shopify API sync notice:', err);
      }
    }

    return {
      provider: 'shopify',
      orders: mappedOrders,
      products: mappedProducts,
    };
  }
}
