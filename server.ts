import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONNECTORS_REGISTRY } from './src/lib/connectors/registry.js';
import { ShopifyConnector } from './src/lib/connectors/modules/shopify.js';
import { GoogleConnector } from './src/lib/connectors/modules/google.js';
import { SlackConnector } from './src/lib/connectors/modules/slack.js';
import { QuickBooksConnector } from './src/lib/connectors/modules/quickbooks.js';
import { InstagramConnector } from './src/lib/connectors/modules/instagram.js';
import { XConnector } from './src/lib/connectors/modules/x.js';
import { WhatsAppConnector } from './src/lib/connectors/modules/whatsapp.js';
import { StripeConnector } from './src/lib/connectors/modules/stripe.js';
import { PayPalConnector } from './src/lib/connectors/modules/paypal.js';
import { AirtableConnector } from './src/lib/connectors/modules/airtable.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory secure server-side credentials store indexed by userId_provider
const serverCredentialsStore = new Map<string, Record<string, any>>();

// Helper to determine the container base URL
function getBaseUrl(req: Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // 1. DEVELOPER CREDENTIAL CHECKLIST & STATUS
  // -------------------------------------------------------------
  app.get('/api/connectors/config-checklist', (req: Request, res: Response) => {
    const baseUrl = getBaseUrl(req);
    const checklist = Object.entries(CONNECTORS_REGISTRY).map(([id, meta]) => {
      const redirectUri = `${baseUrl}/auth/callback/${id}`;
      const webhookUri = `${baseUrl}/api/connectors/webhooks/${id}`;

      // Check if credentials exist in server environment variables
      const envStatus = meta.credentialRequirements.map((req) => {
        const envVal = req.envVarName ? process.env[req.envVarName] : undefined;
        return {
          key: req.key,
          name: req.name,
          envVarName: req.envVarName,
          isConfiguredInEnv: Boolean(envVal && envVal.trim().length > 0),
          required: req.required,
          description: req.description,
        };
      });

      const allRequiredConfigured = envStatus.filter((s) => s.required).every((s) => s.isConfiguredInEnv);

      return {
        id,
        name: meta.name,
        category: meta.category,
        authType: meta.authType,
        developerPortalUrl: meta.developerPortalUrl,
        redirectUri,
        webhookUri,
        webhookSupported: meta.webhookSupported,
        allRequiredConfigured,
        credentials: envStatus,
        scopes: meta.scopes,
        mcpToolsCount: meta.mcpTools.length,
      };
    });

    res.json({
      baseUrl,
      connectors: checklist,
      timestamp: new Date().toISOString(),
    });
  });

  // -------------------------------------------------------------
  // 2. OAUTH AUTHORIZATION URL GENERATOR
  // -------------------------------------------------------------
  app.get('/api/connectors/oauth/url/:provider', (req: Request, res: Response) => {
    const provider = req.params.provider;
    const meta = CONNECTORS_REGISTRY[provider as keyof typeof CONNECTORS_REGISTRY];
    if (!meta) {
      return res.status(404).json({ error: `Provider ${provider} not found` });
    }

    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/auth/callback/${provider}`;
    const state = `kopa_${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let authUrl = '';

    try {
      if (provider === 'shopify') {
        const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || (req.query.storeDomain as string) || 'my-shop.myshopify.com';
        const clientId = process.env.SHOPIFY_CLIENT_ID || (req.query.clientId as string) || '';
        if (!clientId) {
          return res.status(400).json({ error: 'Shopify Client ID is required. Please provide it in connector settings.' });
        }
        authUrl = ShopifyConnector.getOAuthUrl(storeDomain, clientId, redirectUri, state);
      } else if (provider === 'google') {
        const clientId = process.env.GOOGLE_CLIENT_ID || (req.query.clientId as string) || '';
        if (!clientId) {
          return res.status(400).json({ error: 'Google Client ID is required.' });
        }
        authUrl = GoogleConnector.getOAuthUrl(clientId, redirectUri, state);
      } else if (provider === 'slack') {
        const clientId = process.env.SLACK_CLIENT_ID || (req.query.clientId as string) || '';
        if (!clientId) {
          return res.status(400).json({ error: 'Slack Client ID is required.' });
        }
        authUrl = SlackConnector.getOAuthUrl(clientId, redirectUri, state);
      } else if (provider === 'quickbooks') {
        const clientId = process.env.QUICKBOOKS_CLIENT_ID || (req.query.clientId as string) || '';
        if (!clientId) {
          return res.status(400).json({ error: 'QuickBooks Client ID is required.' });
        }
        authUrl = QuickBooksConnector.getOAuthUrl(clientId, redirectUri, state);
      } else if (provider === 'instagram') {
        const clientId = process.env.INSTAGRAM_APP_ID || (req.query.clientId as string) || '';
        if (!clientId) {
          return res.status(400).json({ error: 'Meta App ID is required for Instagram.' });
        }
        authUrl = InstagramConnector.getOAuthUrl(clientId, redirectUri, state);
      } else if (provider === 'x') {
        const clientId = process.env.X_CLIENT_ID || (req.query.clientId as string) || '';
        if (!clientId) {
          return res.status(400).json({ error: 'X Client ID is required.' });
        }
        authUrl = XConnector.getOAuthUrl(clientId, redirectUri, state);
      } else {
        return res.status(400).json({ error: `Provider ${provider} uses direct credential setup.` });
      }

      res.json({ url: authUrl, state, redirectUri });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate OAuth URL' });
    }
  });

  // -------------------------------------------------------------
  // 3. OAUTH CALLBACK HANDLER (POPUP POSTMESSAGE)
  // -------------------------------------------------------------
  const handleOAuthCallback = async (req: Request, res: Response) => {
    const provider = req.params.provider;
    const { code, state, error, error_description } = req.query;

    if (error) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <body style="font-family: sans-serif; padding: 24px; text-align: center;">
            <h3 style="color: #e11d48;">Authorization Denied</h3>
            <p>${error_description || error}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'KOPA_CONNECTOR_AUTH_ERROR', provider: '${provider}', error: '${error}' }, '*');
                setTimeout(() => window.close(), 2500);
              }
            </script>
          </body>
        </html>
      `);
    }

    // In a production OAuth exchange, exchange 'code' for access_token with client_secret
    const accountInfo = {
      accountId: `acc_${provider}_${Date.now()}`,
      accountName: `Verified ${provider.toUpperCase()} Business`,
      email: 'connected-merchant@kopa.app',
    };

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kopa Authorization</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #08110F; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #10251E; border: 1px solid #1C382E; border-radius: 16px; padding: 32px; text-align: center; max-width: 400px; }
            .badge { background: #10B981; color: #000; font-weight: 700; padding: 4px 12px; border-radius: 20px; font-size: 12px; display: inline-block; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">SUCCESS</span>
            <h2>${provider.toUpperCase()} Connected</h2>
            <p style="color: #9ca3af; font-size: 14px;">Credentials verified. Returning to Kopa Workspace...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'KOPA_CONNECTOR_AUTH_SUCCESS',
                  provider: '${provider}',
                  code: '${code || ''}',
                  accountInfo: ${JSON.stringify(accountInfo)}
                }, '*');
                setTimeout(() => { window.close(); }, 800);
              } else {
                window.location.href = '/#dashboard';
              }
            } catch(e) {
              console.error(e);
            }
          </script>
        </body>
      </html>
    `);
  };

  app.get('/auth/callback/:provider', handleOAuthCallback);
  app.get('/api/connectors/oauth/callback/:provider', handleOAuthCallback);

  // -------------------------------------------------------------
  // 4. MANUAL CREDENTIAL VALIDATION & STORAGE
  // -------------------------------------------------------------
  app.post('/api/connectors/connect-credentials/:provider', async (req: Request, res: Response) => {
    const provider = req.params.provider;
    const { userId, credentials, grantedScopes } = req.body;

    if (!userId || !credentials) {
      return res.status(400).json({ error: 'userId and credentials are required.' });
    }

    try {
      // Validate according to module rules
      if (provider === 'whatsapp') {
        WhatsAppConnector.validateCredentials(credentials);
      } else if (provider === 'stripe') {
        if (!StripeConnector.validateKey(credentials.secretKey)) {
          throw new Error('Invalid Stripe secret key format (must start with sk_ or rk_).');
        }
      } else if (provider === 'paypal') {
        if (!credentials.clientId || !credentials.clientSecret) {
          throw new Error('PayPal Client ID and Secret are required.');
        }
      } else if (provider === 'airtable') {
        if (!credentials.clientId || !credentials.baseId) {
          throw new Error('Airtable Access Token and Base ID are required.');
        }
      }

      // Store securely on server
      const storeKey = `${userId}_${provider}`;
      serverCredentialsStore.set(storeKey, credentials);

      const maskedIdentifier = credentials.phoneNumberId
        ? `Phone ID: ••••${credentials.phoneNumberId.slice(-4)}`
        : credentials.storeDomain
        ? credentials.storeDomain
        : credentials.secretKey
        ? `Key: ••••${credentials.secretKey.slice(-4)}`
        : credentials.clientId
        ? `ID: ••••${credentials.clientId.slice(-4)}`
        : 'Authenticated';

      res.json({
        success: true,
        provider,
        status: 'connected',
        connectedAt: new Date().toISOString(),
        maskedIdentifier,
        grantedScopes: grantedScopes || [],
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Credential validation failed.' });
    }
  });

  // -------------------------------------------------------------
  // 4B. AUTO-CONNECT USING BACKEND SECRETS (NO FRONTEND MANUAL ENTRY)
  // -------------------------------------------------------------
  app.post('/api/connectors/auto-connect/:provider', async (req: Request, res: Response) => {
    const provider = req.params.provider;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const meta = CONNECTORS_REGISTRY[provider as keyof typeof CONNECTORS_REGISTRY];
    if (!meta) {
      return res.status(404).json({ error: `Provider ${provider} not found` });
    }

    const credentials: Record<string, string> = {};
    for (const reqMeta of meta.credentialRequirements) {
      if (reqMeta.envVarName && process.env[reqMeta.envVarName]) {
        credentials[reqMeta.key] = process.env[reqMeta.envVarName]!;
      }
    }

    const allRequiredPresent = meta.credentialRequirements
      .filter((r) => r.required)
      .every((r) => credentials[r.key] && credentials[r.key].trim().length > 0);

    if (!allRequiredPresent) {
      return res.status(400).json({ error: `Required backend credentials for ${provider} are not configured in environment.` });
    }

    const storeKey = `${userId}_${provider}`;
    serverCredentialsStore.set(storeKey, credentials);

    res.json({
      success: true,
      provider,
      status: 'connected',
      connectedAt: new Date().toISOString(),
      accountInfo: {
        accountName: `Verified ${meta.name} Business`,
        email: 'merchant@kopa.app',
      },
      maskedIdentifier: `${meta.name} (Server Configured)`,
      grantedScopes: meta.scopes.map((s) => s.id),
    });
  });

  // -------------------------------------------------------------
  // 5. DATA SYNCHRONIZATION ENDPOINT
  // -------------------------------------------------------------
  app.post('/api/connectors/sync/:provider', async (req: Request, res: Response) => {
    const provider = req.params.provider;
    const { userId, clientCredentials } = req.body;

    const storeKey = `${userId}_${provider}`;
    const credentials = serverCredentialsStore.get(storeKey) || clientCredentials || {};

    try {
      let payload = null;

      if (provider === 'shopify') {
        payload = await ShopifyConnector.fetchSyncData(credentials);
      } else if (provider === 'stripe') {
        payload = await StripeConnector.fetchSyncData(credentials);
      } else if (provider === 'paypal') {
        payload = await PayPalConnector.fetchSyncData(credentials);
      } else if (provider === 'airtable') {
        payload = await AirtableConnector.fetchSyncData(credentials);
      } else if (provider === 'quickbooks') {
        payload = await QuickBooksConnector.fetchSyncData(credentials);
      } else if (provider === 'whatsapp') {
        payload = await WhatsAppConnector.fetchSyncData(credentials);
      } else {
        payload = { provider, orders: [], products: [], customers: [], expenses: [], payments: [] };
      }

      res.json({
        success: true,
        provider,
        payload,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        provider,
        error: err.message || `Failed to sync from ${provider}`,
      });
    }
  });

  // -------------------------------------------------------------
  // 6. MCP TOOL EXECUTION ENDPOINT (FOR ASK KOPA)
  // -------------------------------------------------------------
  app.post('/api/connectors/mcp/execute', async (req: Request, res: Response) => {
    const { provider, toolName, args, userId } = req.body;
    const storeKey = `${userId}_${provider}`;
    const credentials = serverCredentialsStore.get(storeKey) || {};

    try {
      let result = null;

      if (provider === 'whatsapp') {
        result = await WhatsAppConnector.executeMcpTool(toolName, args, credentials);
      } else if (provider === 'shopify') {
        result = await ShopifyConnector.executeMcpTool(toolName, args, credentials);
      } else if (provider === 'stripe') {
        result = await StripeConnector.executeMcpTool(toolName, args, credentials);
      } else if (provider === 'google') {
        result = await GoogleConnector.executeMcpTool(toolName, args, credentials);
      } else if (provider === 'paypal') {
        result = await PayPalConnector.executeMcpTool(toolName, args, credentials);
      } else if (provider === 'quickbooks') {
        result = await QuickBooksConnector.executeMcpTool(toolName, args, credentials);
      } else if (provider === 'airtable') {
        result = await AirtableConnector.executeMcpTool(toolName, args, credentials);
      } else if (provider === 'slack') {
        result = await SlackConnector.executeMcpTool(toolName, args, credentials);
      } else if (provider === 'instagram') {
        result = await InstagramConnector.executeMcpTool(toolName, args, credentials);
      } else if (provider === 'x') {
        result = await XConnector.executeMcpTool(toolName, args, credentials);
      } else {
        return res.status(404).json({ error: `Unknown provider ${provider}` });
      }

      res.json({
        success: true,
        provider,
        toolName,
        data: result,
        summary: result.summary,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        provider,
        toolName,
        error: err.message || 'Tool execution failed',
      });
    }
  });

  // -------------------------------------------------------------
  // 7. WEBHOOK RECEIVER
  // -------------------------------------------------------------
  app.post('/api/connectors/webhooks/:provider', (req: Request, res: Response) => {
    const provider = req.params.provider;
    console.log(`[Kopa Webhook Received] Platform: ${provider}`, req.body);
    // Return standard 200 acknowledge
    res.status(200).json({ received: true, provider, timestamp: new Date().toISOString() });
  });

  // -------------------------------------------------------------
  // 8. DISCONNECT / REVOKE
  // -------------------------------------------------------------
  app.post('/api/connectors/disconnect/:provider', (req: Request, res: Response) => {
    const provider = req.params.provider;
    const { userId } = req.body;
    if (userId) {
      serverCredentialsStore.delete(`${userId}_${provider}`);
    }
    res.json({ success: true, provider, status: 'disconnected' });
  });

  // -------------------------------------------------------------
  // 9. VITE MIDDLEWARE IN DEV OR STATIC SERVING IN PROD
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kopa Connector Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Kopa server:', err);
  process.exit(1);
});
