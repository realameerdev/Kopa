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
} from 'lucide-react';
import { ALL_CONNECTORS_LIST, CONNECTORS_REGISTRY } from '../../../lib/connectors/registry';
import { ConnectorMetadata, ConnectorCategory, ConnectorConnection } from '../../../lib/connectors/types';
import { ConnectorCard } from '../connectors/ConnectorCard';
import { ConnectModal } from '../connectors/ConnectModal';
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
  const [activeModalConnector, setActiveModalConnector] = useState<ConnectorMetadata | null>(null);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [globalFeedback, setGlobalFeedback] = useState<string | null>(null);

  // Subscribe to DB changes
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setConnectors(db.getConnectors());
    });
    return () => unsub();
  }, []);

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
          <h1 className="text-xl sm:text-2xl font-heading font-medium tracking-tight text-[#111916] dark:text-white">
            Connected Apps & MCP Integrations
          </h1>
          <p className="text-xs sm:text-sm text-[#48534E] dark:text-slate-400">
            Link external platforms to automate inventory, synchronize sales orders, and empower Ask Kopa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsChecklistOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-[#111916] dark:text-slate-300 dark:hover:text-white border border-[#DEE3DE] dark:border-white/10 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-[#15803D] dark:text-emerald-400" />
            <span>Developer Checklist</span>
          </button>

          <button
            onClick={() => setIsLogsOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-[#111916] dark:text-slate-300 dark:hover:text-white border border-[#DEE3DE] dark:border-white/10 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-[#15803D] dark:text-emerald-400" />
            <span>Sync Logs</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#15803D] dark:bg-emerald-500 text-white dark:text-black hover:opacity-90 disabled:opacity-50 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Syncing...' : 'Sync All'}</span>
          </button>
        </div>
      </div>

      {/* Global Toast Feedback */}
      {globalFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{globalFeedback}</span>
        </div>
      )}

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
        }`}>
          <span className="text-[11px] text-[#48534E] dark:text-slate-400 uppercase tracking-wider font-mono font-medium">
            Connected Services
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-heading font-semibold text-[#15803D] dark:text-emerald-400">
              {connectedCount}
            </span>
            <span className="text-xs text-[#69746F] dark:text-slate-400">/ 10 available</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
        }`}>
          <span className="text-[11px] text-[#48534E] dark:text-slate-400 uppercase tracking-wider font-mono font-medium">
            MCP Tools Active
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-heading font-semibold text-[#111916] dark:text-white">
              {connectors.filter((c) => c.status === 'connected').reduce((acc, c) => acc + (CONNECTORS_REGISTRY[c.provider]?.mcpTools.length || 0), 0)}
            </span>
            <span className="text-xs text-[#69746F] dark:text-slate-400">tools for Ask Kopa</span>
          </div>
        </div>

        <div className={`col-span-2 sm:col-span-1 p-4 rounded-2xl border ${
          isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
        }`}>
          <span className="text-[11px] text-[#48534E] dark:text-slate-400 uppercase tracking-wider font-mono font-medium">
            Data Isolation
          </span>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#15803D] dark:text-emerald-400">
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
            className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
              isDark
                ? 'bg-[#08110F] border-[#1C382E] text-white placeholder:text-slate-600'
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
                  ? 'bg-emerald-500 text-black font-semibold shadow-xs'
                  : isDark
                  ? 'bg-[#10251E]/40 text-slate-400 hover:text-white hover:bg-white/5 border border-[#1C382E]'
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
            return (
              <ConnectorCard
                key={connector.id}
                metadata={connector}
                connection={conn}
                onConnectClick={(meta) => setActiveModalConnector(meta)}
                onSyncComplete={() => setConnectors(db.getConnectors())}
              />
            );
          })}
        </div>
      )}

      {/* Connect Modal */}
      <ConnectModal
        connector={activeModalConnector}
        isOpen={Boolean(activeModalConnector)}
        onClose={() => setActiveModalConnector(null)}
        onConnected={() => setConnectors(db.getConnectors())}
      />

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
