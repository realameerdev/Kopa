import React, { useState, useEffect } from 'react';
import {
  Search,
  Layers,
  Sparkles,
  RefreshCw,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Database,
  Filter,
  Zap,
} from 'lucide-react';
import { ALL_CONNECTORS_LIST, CONNECTORS_REGISTRY } from '../../../lib/connectors/registry';
import { ConnectorMetadata, ConnectorCategory, ConnectorConnection } from '../../../lib/connectors/types';
import { ConnectorCard } from '../connectors/ConnectorCard';
import { DeveloperChecklistModal } from '../connectors/DeveloperChecklistModal';
import { SyncLogsDrawer } from '../connectors/SyncLogsDrawer';
import { db } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';
import { ConnectorSyncEngine } from '../../../lib/connectors/syncEngine';

export const ConnectedAppsView: React.FC = () => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [connectors, setConnectors] = useState<ConnectorConnection[]>(db.getConnectors());
  const [configMap, setConfigMap] = useState<Record<string, boolean>>({});
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isConnectingAll, setIsConnectingAll] = useState(false);
  const [globalFeedback, setGlobalFeedback] = useState<string | null>(null);

  // Fetch backend configuration checklist status on mount
  useEffect(() => {
    fetch('/api/connectors/config-checklist')
      .then((res) => res.json())
      .then((data) => {
        if (data?.connectors) {
          const map: Record<string, boolean> = {};
          data.connectors.forEach((c: any) => {
            map[c.id] = c.allRequiredConfigured;
          });
          setConfigMap(map);
        }
      })
      .catch((e) => console.warn('Failed to fetch connector configuration status:', e));
  }, []);

  // Subscribe to DB changes
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setConnectors(db.getConnectors());
    });
    return () => unsub();
  }, []);

  // Listen for popup postMessage from OAuth callback if used
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'KOPA_CONNECTOR_AUTH_SUCCESS') {
        const provider = event.data.provider;
        const meta = CONNECTORS_REGISTRY[provider as keyof typeof CONNECTORS_REGISTRY];
        if (meta) {
          const connection: ConnectorConnection = {
            id: provider,
            userId: db.getActiveUserId() || 'default_user',
            provider,
            status: 'connected',
            connectedAt: new Date().toISOString(),
            grantedScopes: meta.scopes.map((s) => s.id),
            hasStoredCredentials: true,
            accountInfo: event.data.accountInfo || {
              accountName: `Verified ${meta.name} Business`,
              email: 'connected-merchant@kopa.app',
            },
          };
          db.saveConnector(connection);
          setConnectors(db.getConnectors());
          setGlobalFeedback(`${meta.name} successfully connected!`);
          setTimeout(() => setGlobalFeedback(null), 4000);

          // Trigger initial sync
          try {
            const syncRes = await fetch(`/api/connectors/sync/${provider}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: db.getActiveUserId() || 'default_user' }),
            });
            if (syncRes.ok) {
              const data = await syncRes.json();
              if (data.payload) {
                ConnectorSyncEngine.processSyncPayload(data.payload);
              }
            }
          } catch (e) {
            console.warn('Initial sync warning:', e);
          }
        }
      } else if (event.data?.type === 'KOPA_CONNECTOR_AUTH_ERROR') {
        setGlobalFeedback(`Authorization error: ${event.data.error || 'Denied'}`);
        setTimeout(() => setGlobalFeedback(null), 5000);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectClick = async (meta: ConnectorMetadata) => {
    const isConfigured = Boolean(configMap[meta.id]);
    if (!isConfigured) {
      setGlobalFeedback(`Integration credentials not yet configured for ${meta.name}.`);
      setTimeout(() => setGlobalFeedback(null), 4000);
      return;
    }

    setGlobalFeedback(`Connecting ${meta.name} using backend credentials...`);
    try {
      // Connect using server credentials directly
      const res = await fetch(`/api/connectors/auto-connect/${meta.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: db.getActiveUserId() || 'default_user' }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to connect ${meta.name}`);
      }

      const result = await res.json();
      const connection: ConnectorConnection = {
        id: meta.id,
        userId: db.getActiveUserId() || 'default_user',
        provider: meta.id,
        status: 'connected',
        connectedAt: result.connectedAt || new Date().toISOString(),
        grantedScopes: result.grantedScopes || meta.scopes.map((s) => s.id),
        hasStoredCredentials: true,
        maskedIdentifier: result.maskedIdentifier,
        accountInfo: result.accountInfo || {
          accountName: `Verified ${meta.name} Business`,
          email: 'merchant@kopa.app',
        },
      };

      db.saveConnector(connection);
      setConnectors(db.getConnectors());
      setGlobalFeedback(`${meta.name} connected and verified successfully! Ingesting data...`);

      // Trigger initial sync to ingest records immediately
      try {
        const syncRes = await fetch(`/api/connectors/sync/${meta.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: db.getActiveUserId() || 'default_user' }),
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.payload) {
            const syncResult = ConnectorSyncEngine.processSyncPayload(syncData.payload);
            if (syncResult.itemsProcessed > 0) {
              setGlobalFeedback(`${meta.name} connected! Synced ${syncResult.itemsProcessed} records.`);
            } else {
              setGlobalFeedback(`${meta.name} connected successfully and active for Ask Kopa!`);
            }
          }
        }
      } catch (syncErr) {
        console.warn('Initial sync warning:', syncErr);
      }

      setTimeout(() => setGlobalFeedback(null), 4000);
    } catch (err: any) {
      setGlobalFeedback(`Connection error: ${err.message}`);
      setTimeout(() => setGlobalFeedback(null), 5000);
    }
  };

  const handleConnectAllConfigured = async () => {
    if (isConnectingAll) return;
    setIsConnectingAll(true);
    setGlobalFeedback('Connecting all configured integrations with backend credentials...');

    try {
      const res = await fetch('/api/connectors/auto-connect-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: db.getActiveUserId() || 'default_user' }),
      });

      if (!res.ok) {
        throw new Error('Failed to auto-connect apps.');
      }

      const data = await res.json();
      const connectedList: ConnectorConnection[] = data.connected || [];

      if (connectedList.length === 0) {
        setGlobalFeedback('No unconfigured integrations found.');
        setIsConnectingAll(false);
        setTimeout(() => setGlobalFeedback(null), 3000);
        return;
      }

      for (const conn of connectedList) {
        db.saveConnector(conn);
      }
      setConnectors(db.getConnectors());

      setGlobalFeedback(`Connected ${connectedList.length} apps! Ingesting records...`);

      // Sync all connected apps
      try {
        const syncRes = await fetch('/api/connectors/sync-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: db.getActiveUserId() || 'default_user' }),
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          let totalItems = 0;
          for (const item of syncData.results || []) {
            if (item.payload) {
              const r = ConnectorSyncEngine.processSyncPayload(item.payload);
              totalItems += r.itemsProcessed;
            }
          }
          setGlobalFeedback(`Connected ${connectedList.length} apps! Synced ${totalItems} records into Kopa.`);
        } else {
          setGlobalFeedback(`Connected ${connectedList.length} apps successfully!`);
        }
      } catch {
        setGlobalFeedback(`Connected ${connectedList.length} apps successfully!`);
      }
    } catch (e: any) {
      setGlobalFeedback(`Connection error: ${e.message}`);
    } finally {
      setIsConnectingAll(false);
      setTimeout(() => setGlobalFeedback(null), 4500);
    }
  };

  const handleNotConfiguredClick = (meta: ConnectorMetadata) => {
    setGlobalFeedback(`Coming soon — this integration (${meta.name}) is being prepared.`);
    setTimeout(() => setGlobalFeedback(null), 4000);
  };

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Platforms' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'payments', label: 'Payments' },
    { id: 'messaging', label: 'Messaging' },
    { id: 'accounting', label: 'Accounting' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'social', label: 'Social & Brand' },
  ];

  const filteredConnectors = ALL_CONNECTORS_LIST.filter((connector) => {
    const matchesSearch =
      connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connector.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || connector.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = connectors.filter((c) => c.status === 'connected').length;

  const handleSyncAll = async () => {
    if (isSyncingAll) return;
    const active = connectors.filter((c) => c.status === 'connected');
    if (active.length === 0) {
      setGlobalFeedback('No active integrations connected to sync.');
      setTimeout(() => setGlobalFeedback(null), 3000);
      return;
    }

    setIsSyncingAll(true);
    setGlobalFeedback(`Synchronizing ${active.length} active platform(s)...`);

    let totalSynced = 0;
    for (const conn of active) {
      try {
        const res = await fetch(`/api/connectors/sync/${conn.provider}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: db.getActiveUserId() || 'default_user' }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.payload) {
            const result = ConnectorSyncEngine.processSyncPayload(data.payload);
            totalSynced += result.itemsProcessed;
          }
        }
      } catch (e) {
        console.warn(`Sync failed for ${conn.provider}:`, e);
      }
    }

    setIsSyncingAll(false);
    setGlobalFeedback(`Sync completed: ${totalSynced} items synchronized into Kopa.`);
    setTimeout(() => setGlobalFeedback(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-medium tracking-tight text-[#0F172A] dark:text-white">
            Connected Apps & MCP Integrations
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400">
            Link external platforms to automate inventory, synchronize sales orders, and empower Ask Kopa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleConnectAllConfigured}
            disabled={isConnectingAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white hover:opacity-95 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 text-white ${isConnectingAll ? 'animate-bounce' : ''}`} />
            <span>{isConnectingAll ? 'Connecting Apps...' : 'Connect Configured Apps'}</span>
          </button>

          <button
            onClick={() => setIsChecklistOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-[#0F172A] dark:text-slate-300 dark:hover:text-white border border-[#DCE6F0] dark:border-white/10 transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
            <span>Developer Checklist</span>
          </button>

          <button
            onClick={() => setIsLogsOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-[#0F172A] dark:text-slate-300 dark:hover:text-white border border-[#DCE6F0] dark:border-white/10 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
            <span>Sync Logs</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-[#0F172A] dark:text-white disabled:opacity-50 transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Syncing...' : 'Sync All'}</span>
          </button>
        </div>
      </div>

      {/* Backend Credentials Ready Banner */}
      {Object.values(configMap).some(Boolean) && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDark ? 'bg-[#0D1B2E]/90 border-[#2563EB]/40' : 'bg-blue-50/70 border-blue-200'
        }`}>
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-[#2563EB]/15 text-[#2563EB] dark:text-[#60A5FA] shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white">
                Environment Credentials Configured & Ready
              </h4>
              <p className="text-[11px] sm:text-xs text-[#475569] dark:text-slate-400 mt-0.5">
                Keys for {Object.keys(configMap).filter((k) => configMap[k]).map((k) => CONNECTORS_REGISTRY[k as keyof typeof CONNECTORS_REGISTRY]?.name || k).join(', ')} are verified server-side. Click to link and sync data with zero manual entry.
              </p>
            </div>
          </div>
          <button
            onClick={handleConnectAllConfigured}
            disabled={isConnectingAll}
            className="self-start sm:self-auto shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isConnectingAll ? 'Connecting...' : 'Connect Apps Now'}</span>
          </button>
        </div>
      )}

      {/* Global Toast Feedback */}
      {globalFeedback && (
        <div className="p-3.5 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#2563EB] dark:bg-[#60A5FA]/20 dark:border-[#60A5FA]/30 dark:text-[#60A5FA] flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{globalFeedback}</span>
        </div>
      )}

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-[#0D1B2E] border-[#243B56]' : 'bg-white border-[#DCE6F0]'
        }`}>
          <span className="text-[11px] text-[#475569] dark:text-slate-400 uppercase tracking-wider font-mono font-medium">
            Connected Services
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-heading font-semibold text-[#2563EB] dark:text-[#60A5FA]">
              {connectedCount}
            </span>
            <span className="text-xs text-[#69746F] dark:text-slate-400">/ 10 available</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-[#0D1B2E] border-[#243B56]' : 'bg-white border-[#DCE6F0]'
        }`}>
          <span className="text-[11px] text-[#475569] dark:text-slate-400 uppercase tracking-wider font-mono font-medium">
            MCP Tools Active
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-heading font-semibold text-[#0F172A] dark:text-white">
              {connectors.filter((c) => c.status === 'connected').reduce((acc, c) => acc + (CONNECTORS_REGISTRY[c.provider]?.mcpTools.length || 0), 0)}
            </span>
            <span className="text-xs text-[#69746F] dark:text-slate-400">tools for Ask Kopa</span>
          </div>
        </div>

        <div className={`col-span-2 sm:col-span-1 p-4 rounded-2xl border ${
          isDark ? 'bg-[#0D1B2E] border-[#243B56]' : 'bg-white border-[#DCE6F0]'
        }`}>
          <span className="text-[11px] text-[#475569] dark:text-slate-400 uppercase tracking-wider font-mono font-medium">
            Data Isolation
          </span>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#2563EB] dark:text-[#60A5FA]">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold">Per-Business Encrypted</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Shopify, Stripe, WhatsApp, QuickBooks..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] ${
              isDark
                ? 'bg-[#07111F] border-[#243B56] text-white placeholder:text-slate-600 focus:ring-[#60A5FA]'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white font-semibold shadow-xs'
                  : isDark
                  ? 'bg-[#0D1B2E] text-[#D5E2F0] hover:text-white hover:bg-white/5 border border-[#243B56]'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Connectors Grid */}
      {filteredConnectors.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-heading font-semibold text-base">No connectors match your search</h3>
          <p className="text-xs text-[#69746F] dark:text-slate-400">
            Try adjusting your search query or select another category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConnectors.map((connector) => {
            const conn = connectors.find((c) => c.provider === connector.id);
            const isConfigured = Boolean(configMap[connector.id]);
            return (
              <ConnectorCard
                key={connector.id}
                metadata={connector}
                connection={conn}
                isConfigured={isConfigured}
                onConnectClick={handleConnectClick}
                onNotConfiguredClick={handleNotConfiguredClick}
                onSyncComplete={() => setConnectors(db.getConnectors())}
              />
            );
          })}
        </div>
      )}

      {/* Developer Checklist Modal */}
      <DeveloperChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
      />

      {/* Sync Logs Drawer */}
      <SyncLogsDrawer
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />
    </div>
  );
};
