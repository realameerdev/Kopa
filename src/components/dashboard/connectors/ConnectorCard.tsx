import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PowerOff,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ConnectorMetadata, ConnectorConnection } from '../../../lib/connectors/types';
import { ConnectorIcon } from './ConnectorIcons';
import { db } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';
import { ConnectorSyncEngine } from '../../../lib/connectors/syncEngine';

interface ConnectorCardProps {
  metadata: ConnectorMetadata;
  connection?: ConnectorConnection;
  isConfigured: boolean;
  onConnectClick: (meta: ConnectorMetadata) => void;
  onNotConfiguredClick: (meta: ConnectorMetadata) => void;
  onSyncComplete?: () => void;
}

export const ConnectorCard: React.FC<ConnectorCardProps> = ({
  metadata,
  connection,
  isConfigured,
  onConnectClick,
  onNotConfiguredClick,
  onSyncComplete,
}) => {
  const { isDark } = useTheme();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [disconnectConfirm, setDisconnectConfirm] = useState(false);

  const isConnected = connection && connection.status === 'connected';

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const res = await fetch(`/api/connectors/sync/${metadata.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: db.getActiveUserId() || 'default_user' }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to sync from ${metadata.name}`);
      }

      const data = await res.json();
      if (data.payload) {
        const result = ConnectorSyncEngine.processSyncPayload(data.payload);
        setSyncFeedback(`Synced ${result.itemsProcessed} items successfully!`);
      } else {
        setSyncFeedback('Sync completed. No new items.');
      }

      if (onSyncComplete) onSyncComplete();
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch (err: any) {
      setSyncFeedback(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch(`/api/connectors/disconnect/${metadata.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: db.getActiveUserId() || 'default_user' }),
      });
    } catch {}

    db.disconnectConnector(metadata.id);
    setDisconnectConfirm(false);
    if (onSyncComplete) onSyncComplete();
  };

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
        isConnected
          ? isDark
            ? 'bg-[#0D1B2E] border-[#3B82F6]/40 shadow-lg shadow-blue-950/20'
            : 'bg-blue-50/50 border-blue-200 shadow-xs'
          : isDark
          ? 'bg-[#07111F] border-[#243B56] hover:border-[#3B82F6]/50'
          : 'bg-white border-[#DCE6F0] hover:border-slate-300 shadow-xs'
      }`}
    >
      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isDark ? 'bg-[#040914] border-[#243B56]' : 'bg-slate-50 border-slate-200'
            }`}>
              <ConnectorIcon provider={metadata.id} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-sm sm:text-base leading-snug text-[#0F172A] dark:text-white">
                {metadata.name}
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#475569] dark:text-slate-400 font-medium">
                {metadata.category}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {isConnected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#60A5FA] border border-[#2563EB]/30 dark:border-[#60A5FA]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-pulse" />
              Connected
            </span>
          ) : !isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Coming Soon
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#60A5FA]/20 dark:text-[#60A5FA] border border-[#2563EB]/30 dark:border-[#60A5FA]/30">
              Ready to Connect
            </span>
          )}
        </div>

        {/* Short Description */}
        <p className="text-xs text-[#475569] dark:text-slate-300 leading-relaxed mb-4 line-clamp-2">
          {metadata.shortDescription}
        </p>

        {/* Sync Feedback Toast */}
        {syncFeedback && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/30 text-[11px] text-[#2563EB] dark:text-[#60A5FA] flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{syncFeedback}</span>
          </div>
        )}

        {/* Connected Info Details */}
        {isConnected && (
          <div className={`p-3 rounded-xl border mb-4 text-xs space-y-1.5 ${
            isDark ? 'bg-[#040914]/80 border-[#243B56]' : 'bg-white border-blue-100'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[#475569] dark:text-slate-400 text-[11px]">Account:</span>
              <span className="font-mono text-[11px] font-medium truncate max-w-[170px] text-[#2563EB] dark:text-[#60A5FA]">
                {connection.accountInfo?.accountName || connection.maskedIdentifier || 'Active Business Link'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#475569] dark:text-slate-400 text-[11px]">Last Synced:</span>
              <span className="text-[11px] text-[#0F172A] dark:text-slate-300">
                {connection.lastSyncedAt ? new Date(connection.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending initial sync'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#DCE6F0] dark:border-white/5">
              <span className="text-[#475569] dark:text-slate-400 text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#2563EB] dark:text-[#60A5FA]" />
                <span>Ask Kopa MCP:</span>
              </span>
              <span className="text-[11px] text-[#2563EB] dark:text-[#60A5FA] font-mono font-semibold">
                {metadata.mcpTools.length} tools enabled
              </span>
            </div>
          </div>
        )}

        {/* Scopes & Tools preview */}
        {!isConnected && (
          <div className="flex items-center gap-2 mb-4 text-[11px] text-[#475569] dark:text-slate-400">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 font-mono">
              <ShieldCheck className="w-3 h-3 text-[#2563EB] dark:text-[#60A5FA]" />
              {metadata.scopes.length} scopes
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 font-mono">
              <Layers className="w-3 h-3 text-[#2563EB] dark:text-[#60A5FA]" />
              {metadata.mcpTools.length} MCP tools
            </span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-2 border-t border-[#DCE6F0] dark:border-[#243B56]/50">
        {isConnected ? (
          <div className="flex items-center justify-between gap-2">
            {!disconnectConfirm ? (
              <>
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#60A5FA] hover:bg-[#2563EB]/20 text-xs font-semibold border border-[#2563EB]/30 dark:border-[#60A5FA]/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onConnectClick(metadata)}
                  className="p-2 text-slate-400 hover:text-[#2563EB] hover:bg-[#2563EB]/10 rounded-xl transition-colors cursor-pointer"
                  title="Reconnect Platform"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDisconnectConfirm(true)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Disconnect Platform"
                >
                  <PowerOff className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-between gap-2 text-xs">
                <span className="text-rose-500 dark:text-rose-400 text-[11px] font-medium">Confirm revoke?</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleDisconnect}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold text-[11px] hover:bg-rose-700 cursor-pointer"
                  >
                    Yes, disconnect
                  </button>
                  <button
                    onClick={() => setDisconnectConfirm(false)}
                    className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[11px] hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : !isConfigured ? (
          <button
            type="button"
            onClick={() => onNotConfiguredClick(metadata)}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium text-xs border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            <span>Coming Soon</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onConnectClick(metadata)}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            <span>Connect {metadata.name}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
