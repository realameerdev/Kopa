/**
 * Kopa Connector System & MCP Architecture Types
 */

export type ConnectorProviderId =
  | 'whatsapp'
  | 'google'
  | 'paypal'
  | 'shopify'
  | 'stripe'
  | 'x'
  | 'instagram'
  | 'quickbooks'
  | 'airtable'
  | 'slack';

export type ConnectorCategory =
  | 'messaging'
  | 'payments'
  | 'ecommerce'
  | 'accounting'
  | 'productivity'
  | 'social';

export type AuthType = 'oauth2' | 'oauth2_pkce' | 'api_key_or_token' | 'hybrid';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'expired'
  | 'error'
  | 'needs_configuration';

export interface ScopePermission {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'read' | 'write' | 'admin';
}

export interface DeveloperCredentialRequirement {
  name: string;
  key: string;
  type: 'text' | 'password' | 'url';
  description: string;
  required: boolean;
  placeholder?: string;
  helperUrl?: string;
  envVarName?: string;
}

export interface MCPToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  enum?: string[];
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  parameters: MCPToolParameter[];
  requiredScopes: string[];
  readOnly: boolean;
}

export interface ConnectorMetadata {
  id: ConnectorProviderId;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: ConnectorCategory;
  authType: AuthType;
  developerPortalUrl: string;
  logo: string;
  brandColor: string;
  scopes: ScopePermission[];
  credentialRequirements: DeveloperCredentialRequirement[];
  mcpTools: MCPToolDefinition[];
  supportedSyncEntities: ('products' | 'orders' | 'customers' | 'payments' | 'expenses' | 'messages')[];
  webhookSupported: boolean;
}

export interface ConnectedAccountInfo {
  accountId?: string;
  accountName?: string;
  email?: string;
  avatarUrl?: string;
  workspaceName?: string;
  currency?: string;
  storeDomain?: string;
  phoneNumberId?: string;
}

export interface ConnectorConnection {
  id: string; // usually providerId
  userId: string;
  provider: ConnectorProviderId;
  status: ConnectionStatus;
  connectedAt?: string;
  lastSyncedAt?: string;
  lastSyncStatus?: 'success' | 'failed' | 'in_progress';
  lastSyncError?: string;
  accountInfo?: ConnectedAccountInfo;
  grantedScopes: string[];
  // Securely masked credentials indicator (never expose raw secrets to client)
  hasStoredCredentials: boolean;
  maskedIdentifier?: string;
  syncStats?: {
    productsImported?: number;
    customersImported?: number;
    transactionsImported?: number;
    expensesImported?: number;
    lastItemCount?: number;
  };
  error?: string;
}

export interface SyncLogEntry {
  id: string;
  provider: ConnectorProviderId;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
  entityType: string;
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  message: string;
  details?: Record<string, any>;
}

export interface MCPExecutionRequest {
  provider: ConnectorProviderId;
  toolName: string;
  args: Record<string, any>;
}

export interface MCPExecutionResult {
  success: boolean;
  provider: ConnectorProviderId;
  toolName: string;
  data?: any;
  error?: string;
  summary?: string;
}
