import { ConnectorMetadata, ConnectorProviderId } from './types';

export const CONNECTORS_REGISTRY: Record<ConnectorProviderId, ConnectorMetadata> = {
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    shortDescription: 'Receive customer order messages, payment confirmations, and sync business contacts.',
    longDescription:
      'Connect your Meta WhatsApp Cloud API or WhatsApp Business Platform to automate order notifications, query customer conversation history, and verify incoming mobile payments into your Kopa ledger.',
    category: 'messaging',
    authType: 'api_key_or_token',
    developerPortalUrl: 'https://developers.facebook.com/apps/',
    brandColor: '#25D366',
    logo: 'whatsapp',
    webhookSupported: true,
    supportedSyncEntities: ['customers', 'messages', 'orders'],
    scopes: [
      {
        id: 'whatsapp_business_messaging',
        name: 'Business Messaging',
        description: 'Send order status updates and receipts to customers.',
        required: true,
        category: 'write',
      },
      {
        id: 'whatsapp_business_management',
        name: 'Account & Catalog Management',
        description: 'Read WhatsApp business profile, phone number ID, and catalog items.',
        required: true,
        category: 'read',
      },
    ],
    credentialRequirements: [
      {
        name: 'System User Access Token',
        key: 'accessToken',
        type: 'password',
        description: 'Permanent WhatsApp Cloud API Access Token from Meta Business Manager.',
        required: true,
        placeholder: 'EAAG...',
        envVarName: 'WHATSAPP_ACCESS_TOKEN',
      },
      {
        name: 'Phone Number ID',
        key: 'phoneNumberId',
        type: 'text',
        description: 'The WhatsApp Business Phone Number ID from your App Dashboard.',
        required: true,
        placeholder: '109823485729384',
        envVarName: 'WHATSAPP_PHONE_NUMBER_ID',
      },
      {
        name: 'WhatsApp Business Account ID (WABA ID)',
        key: 'wabaId',
        type: 'text',
        description: 'Your Meta WhatsApp Business Account ID.',
        required: true,
        placeholder: '192837465019283',
        envVarName: 'WHATSAPP_WABA_ID',
      },
    ],
    mcpTools: [
      {
        name: 'whatsapp_send_receipt',
        description: 'Send a formatted receipt or payment confirmation message to a customer on WhatsApp.',
        parameters: [
          { name: 'recipientPhone', type: 'string', description: 'Customer phone number in international format (+234...)', required: true },
          { name: 'orderTitle', type: 'string', description: 'Title or description of the purchase', required: true },
          { name: 'amount', type: 'number', description: 'Amount paid by customer', required: true },
          { name: 'currency', type: 'string', description: 'Currency code (e.g. NGN, USD)', required: true },
        ],
        requiredScopes: ['whatsapp_business_messaging'],
        readOnly: false,
      },
      {
        name: 'whatsapp_get_recent_messages',
        description: 'Fetch recent incoming customer messages and inquiry threads.',
        parameters: [
          { name: 'limit', type: 'number', description: 'Number of recent conversations to retrieve (max 20)', required: false },
        ],
        requiredScopes: ['whatsapp_business_management'],
        readOnly: true,
      },
    ],
  },

  shopify: {
    id: 'shopify',
    name: 'Shopify',
    shortDescription: 'Sync online storefront orders, inventory levels, customers, and gross sales directly.',
    longDescription:
      'Connect your Shopify store via OAuth2 to automatically ingest orders into Kopa transactions, sync inventory stock alerts, and track customer lifetime value without manual bookkeeping.',
    category: 'ecommerce',
    authType: 'oauth2',
    developerPortalUrl: 'https://partners.shopify.com/',
    brandColor: '#96BF48',
    logo: 'shopify',
    webhookSupported: true,
    supportedSyncEntities: ['products', 'orders', 'customers'],
    scopes: [
      { id: 'read_products', name: 'Read Products', description: 'Access product catalog, variants, and stock levels.', required: true, category: 'read' },
      { id: 'read_orders', name: 'Read Orders', description: 'Read order transactions, customer payments, and fulfillment status.', required: true, category: 'read' },
      { id: 'read_customers', name: 'Read Customers', description: 'Access customer contact details and purchase histories.', required: true, category: 'read' },
      { id: 'read_inventory', name: 'Read Inventory', description: 'Check real-time stock levels across warehouses.', required: true, category: 'read' },
    ],
    credentialRequirements: [
      {
        name: 'Store Domain / Subdomain',
        key: 'storeDomain',
        type: 'text',
        description: 'Your Shopify store myshopify domain (e.g. my-store.myshopify.com or custom domain).',
        required: true,
        placeholder: 'brand-store.myshopify.com',
      },
      {
        name: 'Shopify API Key / Client ID',
        key: 'clientId',
        type: 'text',
        description: 'Shopify App Client ID from Shopify Partner Dashboard.',
        required: true,
        envVarName: 'SHOPIFY_CLIENT_ID',
      },
      {
        name: 'Shopify Client Secret',
        key: 'clientSecret',
        type: 'password',
        description: 'Shopify App Client Secret (stored securely on server).',
        required: true,
        envVarName: 'SHOPIFY_CLIENT_SECRET',
      },
    ],
    mcpTools: [
      {
        name: 'shopify_read_orders',
        description: 'Fetch recent orders with order amounts, customer names, fulfillment status, and items.',
        parameters: [
          { name: 'limit', type: 'number', description: 'Number of orders to retrieve (1-50)', required: false },
          { name: 'status', type: 'string', description: 'Filter by status: open, closed, any', required: false, enum: ['open', 'closed', 'any'] },
        ],
        requiredScopes: ['read_orders'],
        readOnly: true,
      },
      {
        name: 'shopify_read_products',
        description: 'Retrieve live product inventory, pricing, SKU, and availability from Shopify store.',
        parameters: [
          { name: 'search', type: 'string', description: 'Search term for product title or tag', required: false },
        ],
        requiredScopes: ['read_products'],
        readOnly: true,
      },
      {
        name: 'shopify_sync_sales',
        description: 'Trigger an immediate pull of unrecorded Shopify sales into Kopa transactions.',
        parameters: [],
        requiredScopes: ['read_orders', 'read_products'],
        readOnly: false,
      },
    ],
  },

  stripe: {
    id: 'stripe',
    name: 'Stripe',
    shortDescription: 'Synchronize international card payments, refunds, payouts, and customer balances.',
    longDescription:
      'Connect Stripe Connect OAuth or your Restricted API Key to stream card charges, dispute deductions, and payout deposits into Kopa verified revenue.',
    category: 'payments',
    authType: 'hybrid',
    developerPortalUrl: 'https://dashboard.stripe.com/apikeys',
    brandColor: '#635BFF',
    logo: 'stripe',
    webhookSupported: true,
    supportedSyncEntities: ['payments', 'customers'],
    scopes: [
      { id: 'charges.read', name: 'Read Charges & Payments', description: 'Access successful card transactions, charges, and refunds.', required: true, category: 'read' },
      { id: 'balance.read', name: 'Read Available Balance', description: 'View available and pending payout balances.', required: true, category: 'read' },
      { id: 'customers.read', name: 'Read Customers', description: 'Access customer payment profiles.', required: false, category: 'read' },
    ],
    credentialRequirements: [
      {
        name: 'Stripe Secret or Restricted Key',
        key: 'secretKey',
        type: 'password',
        description: 'Restricted Key with read access to Charges, Balance, and Payouts.',
        required: true,
        placeholder: 'rk_live_... or sk_live_...',
        envVarName: 'STRIPE_SECRET_KEY',
      },
      {
        name: 'Stripe Webhook Signing Secret',
        key: 'webhookSecret',
        type: 'password',
        description: 'Endpoint signing secret for real-time charge.succeeded events.',
        required: false,
        placeholder: 'whsec_...',
        envVarName: 'STRIPE_WEBHOOK_SECRET',
      },
    ],
    mcpTools: [
      {
        name: 'stripe_read_payments',
        description: 'Fetch recent Stripe charges, payment intents, and payout records.',
        parameters: [
          { name: 'limit', type: 'number', description: 'Number of charges to retrieve', required: false },
        ],
        requiredScopes: ['charges.read'],
        readOnly: true,
      },
      {
        name: 'stripe_get_balance',
        description: 'Get current available balance, pending funds, and pending payouts in Stripe.',
        parameters: [],
        requiredScopes: ['balance.read'],
        readOnly: true,
      },
    ],
  },

  google: {
    id: 'google',
    name: 'Google Workspace',
    shortDescription: 'Export live financial reports to Google Sheets and backup Kopa receipts to Google Drive.',
    longDescription:
      'Connect Google OAuth 2.0 to automate spreadsheet reconciliation in Google Sheets, archive invoices to Google Drive, and sync business customer contacts.',
    category: 'productivity',
    authType: 'oauth2',
    developerPortalUrl: 'https://console.cloud.google.com/apis/credentials',
    brandColor: '#4285F4',
    logo: 'google',
    webhookSupported: false,
    supportedSyncEntities: ['products', 'orders', 'customers', 'expenses'],
    scopes: [
      { id: 'https://www.googleapis.com/auth/spreadsheets', name: 'Google Sheets', description: 'Read and update business ledgers in Google Sheets.', required: true, category: 'write' },
      { id: 'https://www.googleapis.com/auth/drive.file', name: 'Google Drive (App Files)', description: 'Store generated monthly statement PDFs and receipts.', required: false, category: 'write' },
      { id: 'https://www.googleapis.com/auth/drive', name: 'Google Drive Full Access', description: 'Read, write, and backup business files in Google Drive.', required: false, category: 'write' },
      { id: 'https://www.googleapis.com/auth/userinfo.email', name: 'Email Info', description: 'Identify connected Google account.', required: true, category: 'read' },
    ],
    credentialRequirements: [
      {
        name: 'Google OAuth Client ID',
        key: 'clientId',
        type: 'text',
        description: 'Google Cloud Platform Web Application Client ID.',
        required: true,
        envVarName: 'GOOGLE_CLIENT_ID',
      },
      {
        name: 'Google OAuth Client Secret',
        key: 'clientSecret',
        type: 'password',
        description: 'Google Cloud Platform Web Application Client Secret.',
        required: true,
        envVarName: 'GOOGLE_CLIENT_SECRET',
      },
    ],
    mcpTools: [
      {
        name: 'google_drive_backup_ledger',
        description: 'Backup all current transactions, inventory records, and customers directly to Google Drive.',
        parameters: [
          { name: 'filename', type: 'string', description: 'Backup file name in Google Drive', required: false },
        ],
        requiredScopes: ['https://www.googleapis.com/auth/drive.file'],
        readOnly: false,
      },
      {
        name: 'google_drive_list_files',
        description: 'List recent financial records, statements, and spreadsheets stored in Google Drive.',
        parameters: [
          { name: 'pageSize', type: 'number', description: 'Number of files to retrieve (default 15)', required: false },
        ],
        requiredScopes: ['https://www.googleapis.com/auth/drive.file'],
        readOnly: true,
      },
      {
        name: 'google_export_to_sheets',
        description: 'Export Kopa transaction history or inventory audit to a new or existing Google Sheet.',
        parameters: [
          { name: 'sheetTitle', type: 'string', description: 'Title for the spreadsheet', required: true },
          { name: 'entityType', type: 'string', description: 'Data to export: transactions, products, customers, expenses', required: true, enum: ['transactions', 'products', 'customers', 'expenses'] },
        ],
        requiredScopes: ['https://www.googleapis.com/auth/spreadsheets'],
        readOnly: false,
      },
      {
        name: 'google_read_sheet_data',
        description: 'Read rows from a connected inventory or expense Google Sheet to import into Kopa.',
        parameters: [
          { name: 'spreadsheetId', type: 'string', description: 'The ID string of the Google Spreadsheet', required: true },
          { name: 'range', type: 'string', description: 'Sheet and cell range (e.g. Sheet1!A1:E50)', required: true },
        ],
        requiredScopes: ['https://www.googleapis.com/auth/spreadsheets'],
        readOnly: true,
      },
    ],
  },

  paypal: {
    id: 'paypal',
    name: 'PayPal',
    shortDescription: 'Ingest PayPal merchant transactions, invoice settlements, and buyer payments.',
    longDescription:
      'Connect PayPal REST API credentials to monitor multi-currency buyer checkouts, reconcile transaction fees, and keep Kopa revenue synchronized.',
    category: 'payments',
    authType: 'oauth2',
    developerPortalUrl: 'https://developer.paypal.com/dashboard/applications',
    brandColor: '#003087',
    logo: 'paypal',
    webhookSupported: true,
    supportedSyncEntities: ['payments', 'orders'],
    scopes: [
      { id: 'https://uri.paypal.com/services/reporting/search/read', name: 'Transaction Reporting', description: 'Read transaction history, payments, and fees.', required: true, category: 'read' },
      { id: 'https://uri.paypal.com/services/invoicing', name: 'Invoicing', description: 'Read PayPal invoice payment states.', required: false, category: 'read' },
    ],
    credentialRequirements: [
      {
        name: 'PayPal Client ID',
        key: 'clientId',
        type: 'text',
        description: 'REST API Client ID from PayPal Developer Dashboard.',
        required: true,
        envVarName: 'PAYPAL_CLIENT_ID',
      },
      {
        name: 'PayPal Secret Key',
        key: 'clientSecret',
        type: 'password',
        description: 'REST API Secret Key from PayPal Developer Dashboard.',
        required: true,
        envVarName: 'PAYPAL_CLIENT_SECRET',
      },
      {
        name: 'Environment',
        key: 'environment',
        type: 'text',
        description: 'live or sandbox',
        required: true,
        placeholder: 'live',
      },
    ],
    mcpTools: [
      {
        name: 'paypal_read_transactions',
        description: 'List recent PayPal sales, buyer details, and net settlement amounts.',
        parameters: [
          { name: 'daysBack', type: 'number', description: 'Number of past days to query (default 30)', required: false },
        ],
        requiredScopes: ['https://uri.paypal.com/services/reporting/search/read'],
        readOnly: true,
      },
    ],
  },

  quickbooks: {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    shortDescription: 'Reconcile accounting invoices, tax records, vendor expenses, and ledger entries.',
    longDescription:
      'Connect Intuit QuickBooks Online via OAuth2 to maintain continuous synchronization between your day-to-day Kopa sales ledger and certified CPA accounting.',
    category: 'accounting',
    authType: 'oauth2',
    developerPortalUrl: 'https://developer.intuit.com/',
    brandColor: '#2CA01C',
    logo: 'quickbooks',
    webhookSupported: true,
    supportedSyncEntities: ['expenses', 'orders', 'customers'],
    scopes: [
      { id: 'com.intuit.quickbooks.accounting', name: 'Accounting Data', description: 'Read and write accounting invoices, chart of accounts, and expenses.', required: true, category: 'read' },
    ],
    credentialRequirements: [
      {
        name: 'QuickBooks Client ID',
        key: 'clientId',
        type: 'text',
        description: 'App Client ID from Intuit Developer Portal.',
        required: true,
        envVarName: 'QUICKBOOKS_CLIENT_ID',
      },
      {
        name: 'QuickBooks Client Secret',
        key: 'clientSecret',
        type: 'password',
        description: 'App Client Secret from Intuit Developer Portal.',
        required: true,
        envVarName: 'QUICKBOOKS_CLIENT_SECRET',
      },
      {
        name: 'QuickBooks Realm ID / Company ID',
        key: 'realmId',
        type: 'text',
        description: 'Your QuickBooks Online Company ID.',
        required: false,
      },
    ],
    mcpTools: [
      {
        name: 'quickbooks_read_invoices',
        description: 'Fetch open and paid customer invoices from QuickBooks.',
        parameters: [
          { name: 'status', type: 'string', description: 'Filter by Paid, Unpaid, or Overdue', required: false },
        ],
        requiredScopes: ['com.intuit.quickbooks.accounting'],
        readOnly: true,
      },
      {
        name: 'quickbooks_sync_expenses',
        description: 'Import certified vendor expenses and utility bills from QuickBooks into Kopa.',
        parameters: [],
        requiredScopes: ['com.intuit.quickbooks.accounting'],
        readOnly: false,
      },
    ],
  },

  airtable: {
    id: 'airtable',
    name: 'Airtable',
    shortDescription: 'Link custom inventory bases, supplier tables, and custom order workflows.',
    longDescription:
      'Connect Airtable via OAuth 2.0 PKCE or Personal Access Token to map tables directly to Kopa products, suppliers, and customer orders with two-way syncing.',
    category: 'productivity',
    authType: 'oauth2_pkce',
    developerPortalUrl: 'https://airtable.com/create/tokens',
    brandColor: '#FCB400',
    logo: 'airtable',
    webhookSupported: true,
    supportedSyncEntities: ['products', 'customers', 'orders'],
    scopes: [
      { id: 'data.records:read', name: 'Read Records', description: 'Read table records, schema fields, and cell values.', required: true, category: 'read' },
      { id: 'data.records:write', name: 'Write Records', description: 'Create and update records in authorized bases.', required: true, category: 'write' },
      { id: 'schema.bases:read', name: 'Read Base Schema', description: 'Inspect table names, columns, and field configurations.', required: true, category: 'read' },
    ],
    credentialRequirements: [
      {
        name: 'Airtable OAuth Client ID or Token',
        key: 'clientId',
        type: 'text',
        description: 'Airtable OAuth Client ID or Personal Access Token (PAT).',
        required: true,
        placeholder: 'pat...',
        envVarName: 'AIRTABLE_CLIENT_ID',
      },
      {
        name: 'Airtable Base ID',
        key: 'baseId',
        type: 'text',
        description: 'Airtable Base identifier (starts with app...).',
        required: true,
        placeholder: 'appXXXXXXXXXXXXXX',
      },
      {
        name: 'Products/Orders Table Name',
        key: 'tableName',
        type: 'text',
        description: 'The exact name of the Table in your Base to sync.',
        required: true,
        placeholder: 'Products or Inventory',
      },
    ],
    mcpTools: [
      {
        name: 'airtable_fetch_records',
        description: 'Query records from your connected Airtable base and table.',
        parameters: [
          { name: 'maxRecords', type: 'number', description: 'Maximum records to fetch (max 100)', required: false },
          { name: 'filterByFormula', type: 'string', description: 'Optional Airtable formula filter', required: false },
        ],
        requiredScopes: ['data.records:read'],
        readOnly: true,
      },
      {
        name: 'airtable_sync_catalog',
        description: 'Synchronize items from Airtable into Kopa product inventory.',
        parameters: [],
        requiredScopes: ['data.records:read'],
        readOnly: false,
      },
    ],
  },

  slack: {
    id: 'slack',
    name: 'Slack',
    shortDescription: 'Receive instant low-stock alerts, sales digests, and query Kopa from Slack channels.',
    longDescription:
      'Connect your Slack Workspace using OAuth 2.0 to post daily revenue summaries, alert staff on critical low-stock items, and log sales announcements.',
    category: 'messaging',
    authType: 'oauth2',
    developerPortalUrl: 'https://api.slack.com/apps',
    brandColor: '#4A154B',
    logo: 'slack',
    webhookSupported: true,
    supportedSyncEntities: ['messages'],
    scopes: [
      { id: 'chat:write', name: 'Post Messages', description: 'Send automated alerts and sales notifications to designated channels.', required: true, category: 'write' },
      { id: 'channels:read', name: 'Read Public Channels', description: 'List accessible public channels to choose notification targets.', required: true, category: 'read' },
      { id: 'incoming-webhook', name: 'Incoming Webhooks', description: 'Post formatted summaries via dedicated webhooks.', required: false, category: 'write' },
    ],
    credentialRequirements: [
      {
        name: 'Slack Client ID',
        key: 'clientId',
        type: 'text',
        description: 'Slack App Client ID from api.slack.com.',
        required: true,
        envVarName: 'SLACK_CLIENT_ID',
      },
      {
        name: 'Slack Client Secret',
        key: 'clientSecret',
        type: 'password',
        description: 'Slack App Client Secret.',
        required: true,
        envVarName: 'SLACK_CLIENT_SECRET',
      },
      {
        name: 'Default Alert Channel',
        key: 'defaultChannel',
        type: 'text',
        description: 'Channel name for notifications (e.g. #sales-alerts or #general).',
        required: false,
        placeholder: '#sales-alerts',
      },
    ],
    mcpTools: [
      {
        name: 'slack_send_daily_digest',
        description: 'Post a formatted daily financial and operations digest to the Slack channel.',
        parameters: [
          { name: 'channel', type: 'string', description: 'Target channel name (e.g. #sales)', required: false },
        ],
        requiredScopes: ['chat:write'],
        readOnly: false,
      },
      {
        name: 'slack_post_alert',
        description: 'Post an urgent low stock or overdue debtor alert to Slack.',
        parameters: [
          { name: 'alertText', type: 'string', description: 'The alert message content', required: true },
          { name: 'level', type: 'string', description: 'info, warning, or critical', required: false, enum: ['info', 'warning', 'critical'] },
        ],
        requiredScopes: ['chat:write'],
        readOnly: false,
      },
    ],
  },

  instagram: {
    id: 'instagram',
    name: 'Instagram for Business',
    shortDescription: 'Track product inquiries from Direct Messages and monitor shop catalog engagement.',
    longDescription:
      'Connect Instagram Professional / Creator account via Meta OAuth to monitor customer direct message orders, product tags, and conversion engagement directly in Kopa.',
    category: 'social',
    authType: 'oauth2',
    developerPortalUrl: 'https://developers.facebook.com/docs/instagram-platform',
    brandColor: '#E4405F',
    logo: 'instagram',
    webhookSupported: true,
    supportedSyncEntities: ['messages', 'customers'],
    scopes: [
      { id: 'instagram_basic', name: 'Basic Profile & Media', description: 'Read Instagram account profile and media insights.', required: true, category: 'read' },
      { id: 'instagram_manage_messages', name: 'Direct Messages', description: 'Receive customer product purchase inquiries from DMs.', required: true, category: 'read' },
    ],
    credentialRequirements: [
      {
        name: 'Meta App ID (Client ID)',
        key: 'clientId',
        type: 'text',
        description: 'Meta for Developers App ID configured for Instagram Graph API.',
        required: true,
        envVarName: 'INSTAGRAM_APP_ID',
      },
      {
        name: 'Meta App Secret',
        key: 'clientSecret',
        type: 'password',
        description: 'Meta App Secret.',
        required: true,
        envVarName: 'INSTAGRAM_APP_SECRET',
      },
      {
        name: 'Instagram Business Account ID',
        key: 'igUserId',
        type: 'text',
        description: 'Your linked Instagram Business User ID.',
        required: false,
      },
    ],
    mcpTools: [
      {
        name: 'instagram_get_inquiries',
        description: 'Fetch recent customer product questions and purchase inquiries from Instagram Direct.',
        parameters: [
          { name: 'limit', type: 'number', description: 'Max inquiries to retrieve (1-20)', required: false },
        ],
        requiredScopes: ['instagram_manage_messages'],
        readOnly: true,
      },
    ],
  },

  x: {
    id: 'x',
    name: 'X (Twitter)',
    shortDescription: 'Track brand mentions, customer customer service inquiries, and product launch reach.',
    longDescription:
      'Connect your X account via OAuth 2.0 PKCE to monitor brand feedback, track viral product mentions, and post official business milestone announcements.',
    category: 'social',
    authType: 'oauth2_pkce',
    developerPortalUrl: 'https://developer.x.com/en/portal/dashboard',
    brandColor: '#000000',
    logo: 'x',
    webhookSupported: false,
    supportedSyncEntities: ['messages'],
    scopes: [
      { id: 'tweet.read', name: 'Read Posts & Mentions', description: 'Read account posts, customer mentions, and metrics.', required: true, category: 'read' },
      { id: 'users.read', name: 'Read Profile Info', description: 'Access follower counts and account details.', required: true, category: 'read' },
      { id: 'tweet.write', name: 'Publish Posts', description: 'Post business milestone updates or announcements.', required: false, category: 'write' },
    ],
    credentialRequirements: [
      {
        name: 'X OAuth 2.0 Client ID',
        key: 'clientId',
        type: 'text',
        description: 'Client ID with OAuth 2.0 PKCE enabled in X Developer Portal.',
        required: true,
        envVarName: 'X_CLIENT_ID',
      },
      {
        name: 'X OAuth 2.0 Client Secret',
        key: 'clientSecret',
        type: 'password',
        description: 'Client Secret from X Developer Portal.',
        required: true,
        envVarName: 'X_CLIENT_SECRET',
      },
    ],
    mcpTools: [
      {
        name: 'x_get_brand_mentions',
        description: 'Fetch recent mentions and customer feedback on X.',
        parameters: [
          { name: 'maxResults', type: 'number', description: 'Number of posts to fetch (10-50)', required: false },
        ],
        requiredScopes: ['tweet.read'],
        readOnly: true,
      },
      {
        name: 'x_post_announcement',
        description: 'Publish a new business announcement or product launch tweet to X.',
        parameters: [
          { name: 'text', type: 'string', description: 'Tweet content (max 280 characters)', required: true },
        ],
        requiredScopes: ['tweet.write'],
        readOnly: false,
      },
    ],
  },
};

export const ALL_CONNECTORS_LIST = Object.values(CONNECTORS_REGISTRY);
