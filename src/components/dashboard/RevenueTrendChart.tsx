import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  RefreshCw,
  Layers,
  Calendar,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  ExternalLink,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { db, Transaction } from '../../lib/db';
import { useTheme } from '../../context/ThemeContext';
import { CONNECTORS_REGISTRY } from '../../lib/connectors/registry';
import { ConnectorSyncEngine } from '../../lib/connectors/syncEngine';
import { ConnectorConnection, ConnectorProviderId } from '../../lib/connectors/types';

interface RevenueTrendChartProps {
  onNavigate?: (view: string) => void;
  onOpenRecordSale?: () => void;
}

interface DayRevenueData {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // "14", "15"
  dayOfWeek: string; // "Mon", "Tue"
  fullFormattedDate: string; // "Monday, Sep 28, 2026"
  totalRevenue: number;
  orderCount: number;
  isToday: boolean;
  isPeak: boolean;
  bySource: Record<string, { amount: number; count: number; name: string; color: string }>;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  onNavigate,
  onOpenRecordSale,
}) => {
  const { isDark } = useTheme();
  const settings = db.getSettings();
  const currencySymbol = settings.currencySymbol || '₦';

  // Reactive DB subscriptions
  const [transactions, setTransactions] = useState<Transaction[]>(db.getTransactions());
  const [connectors, setConnectors] = useState<ConnectorConnection[]>(db.getConnectors());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [hoveredDay, setHoveredDay] = useState<DayRevenueData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayRevenueData | null>(null);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setTransactions(db.getTransactions());
      setConnectors(db.getConnectors());
    });
    return () => unsub();
  }, []);

  // Connected apps count
  const activeConnectors = useMemo(() => {
    return connectors.filter((c) => c.status === 'connected');
  }, [connectors]);

  // Handle Triggering Live Sync from configured connectors
  const handleSyncConnectors = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncFeedback('Fetching latest records from configured connectors...');

    try {
      const active = connectors.filter((c) => c.status === 'connected');
      let syncedCount = 0;
      let errorsCount = 0;

      // 1. Try batch sync endpoint first
      const batchRes = await fetch('/api/connectors/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: db.getActiveUserId() || 'default_user' }),
      }).catch(() => null);

      if (batchRes && batchRes.ok) {
        const batchData = await batchRes.json();
        if (batchData.results && Array.isArray(batchData.results)) {
          for (const item of batchData.results) {
            if (item.success && item.payload) {
              const res = ConnectorSyncEngine.processSyncPayload(item.payload);
              syncedCount += res.itemsProcessed;
            }
          }
        }
      } else if (active.length > 0) {
        // Fallback: sync individually
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
                syncedCount += result.itemsProcessed;
              }
            } else {
              errorsCount++;
            }
          } catch {
            errorsCount++;
          }
        }
      }

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (syncedCount > 0) {
        setSyncFeedback(`Successfully synchronized ${syncedCount} record(s) into 30-day ledger.`);
      } else if (active.length === 0) {
        setSyncFeedback('No external connectors connected yet. In-store ledger is up to date.');
      } else {
        setSyncFeedback('All connected accounts are currently up to date.');
      }
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      setSyncFeedback(`Sync note: ${err.message || 'Could not reach sync endpoint'}`);
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Build continuous 30-day timeline array (today - 29 days up to today)
  const { timeline, maxDailyRevenue, total30DayRevenue, dailyAverageRevenue, peakDay, connectorRevenueShare, availableSources } = useMemo(() => {
    const days: DayRevenueData[] = [];
    const now = new Date();
    const sourcesSet = new Set<string>();

    // Prepare 30 consecutive calendar days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = i === 0;

      days.push({
        date: d,
        dateStr,
        dayLabel: String(d.getDate()),
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullFormattedDate: d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        totalRevenue: 0,
        orderCount: 0,
        isToday,
        isPeak: false,
        bySource: {},
      });
    }

    // Index days by YYYY-MM-DD
    const dayMap = new Map<string, DayRevenueData>();
    days.forEach((day) => dayMap.set(day.dateStr, day));

    // Populate revenue from transactions
    let allRevenue = 0;
    let externalConnectorRevenue = 0;

    transactions.forEach((tx) => {
      // Count sales and completed payments as revenue
      if (tx.status === 'cancelled') return;
      if (tx.type !== 'sale' && tx.type !== 'payment') return;

      const txDateStr = tx.date ? tx.date.split('T')[0] : '';
      const dayData = dayMap.get(txDateStr);
      if (!dayData) return; // outside 30-day window

      const providerKey = (tx.sourceProvider || 'in-store').toLowerCase();
      sourcesSet.add(providerKey);

      // Check if matches currently selected source filter
      const matchesFilter = selectedSource === 'all' || providerKey === selectedSource;

      // Track revenue for metrics
      allRevenue += tx.amount;
      if (providerKey !== 'in-store' && providerKey !== 'manual' && providerKey !== 'kopa') {
        externalConnectorRevenue += tx.amount;
      }

      if (matchesFilter) {
        dayData.totalRevenue += tx.amount;
        dayData.orderCount += 1;

        // Breakdown by source
        const meta = CONNECTORS_REGISTRY[providerKey as ConnectorProviderId];
        const srcName = meta ? meta.name : providerKey === 'in-store' ? 'In-Store / Direct' : providerKey.toUpperCase();
        const srcColor = meta ? meta.brandColor : providerKey === 'in-store' ? '#2563EB' : '#60A5FA';

        if (!dayData.bySource[providerKey]) {
          dayData.bySource[providerKey] = {
            amount: 0,
            count: 0,
            name: srcName,
            color: srcColor,
          };
        }
        dayData.bySource[providerKey].amount += tx.amount;
        dayData.bySource[providerKey].count += 1;
      }
    });

    // Find peak day
    let peak: DayRevenueData | null = null;
    let max = 0;

    days.forEach((day) => {
      if (day.totalRevenue > max) {
        max = day.totalRevenue;
        peak = day;
      }
    });

    if (peak) {
      (peak as DayRevenueData).isPeak = true;
    }

    const filteredTotalRevenue = days.reduce((sum, d) => sum + d.totalRevenue, 0);
    const avg = Math.round(filteredTotalRevenue / 30);
    const connectorShare = allRevenue > 0 ? Math.round((externalConnectorRevenue / allRevenue) * 100) : 0;

    return {
      timeline: days,
      maxDailyRevenue: Math.max(max, 1000), // ensure baseline floor
      total30DayRevenue: filteredTotalRevenue,
      dailyAverageRevenue: avg,
      peakDay: peak as DayRevenueData | null,
      connectorRevenueShare: connectorShare,
      availableSources: Array.from(sourcesSet),
    };
  }, [transactions, selectedSource]);

  // Round grid upper scale to clean number
  const yAxisCeiling = useMemo(() => {
    if (maxDailyRevenue <= 10000) return 10000;
    if (maxDailyRevenue <= 50000) return Math.ceil(maxDailyRevenue / 10000) * 10000;
    if (maxDailyRevenue <= 250000) return Math.ceil(maxDailyRevenue / 50000) * 50000;
    if (maxDailyRevenue <= 1000000) return Math.ceil(maxDailyRevenue / 100000) * 100000;
    return Math.ceil(maxDailyRevenue / 500000) * 500000;
  }, [maxDailyRevenue]);

  const activeDay = hoveredDay || selectedDay || timeline[timeline.length - 1];

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all ${
        isDark ? 'bg-[#0D1B2E] border-[#243B56] text-[#F8FBFF]' : 'bg-[#FFFFFF] border-[#DCE6F0] text-[#0F172A] shadow-xs'
      }`}
    >
      {/* 
        1. HEADER ROW: Title, Subtitle, Sync Action, and Connector Status
      */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#DCE6F0] dark:border-[#243B56]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/20 text-[#2563EB] dark:text-[#60A5FA]">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-heading font-semibold tracking-tight">
              30-Day Revenue Trends & Connector Analytics
            </h2>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#9FB1C5] mt-1">
            Daily verified revenue trends aggregated from connected sales channels and in-store transactions.
          </p>
        </div>

        {/* Sync & Connector Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Connector Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
              activeConnectors.length > 0
                ? isDark
                  ? 'bg-[#102B4D]/60 border-[#243B56] text-[#60A5FA]'
                  : 'bg-[#EAF2FF] border-[#2563EB]/30 text-[#0F3B82]'
                : isDark
                ? 'bg-[#132640] border-[#243B56] text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {activeConnectors.length > 0
                ? `${activeConnectors.length} Connector${activeConnectors.length > 1 ? 's' : ''} Synced`
                : 'No Connectors Linked'}
            </span>
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={handleSyncConnectors}
            disabled={isSyncing}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
              isSyncing
                ? 'bg-slate-400 text-white cursor-not-allowed opacity-80'
                : 'bg-[#2563EB] dark:bg-[#3B82F6] text-white hover:bg-[#1D4ED8] dark:hover:bg-[#2563EB]'
            }`}
            title="Fetch and sync latest financial records from configured connectors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Connectors'}</span>
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('connected-apps')}
              className={`p-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                isDark
                  ? 'border-[#243B56] text-[#9FB1C5] hover:text-white hover:bg-white/5'
                  : 'border-[#DCE6F0] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
              }`}
              title="Manage Connected Apps"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sync Status Feedback Toast */}
      {syncFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`my-3 p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
            syncFeedback.includes('Successfully')
              ? 'bg-[#16A34A]/10 border-[#16A34A]/30 text-[#16A34A] dark:text-[#4ADE80]'
              : 'bg-blue-500/10 border-blue-500/30 text-[#2563EB] dark:text-[#60A5FA]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncFeedback}</span>
        </motion.div>
      )}

      {/* 
        2. KPI METRICS RIBBON (30-Day Totals, Daily Avg, Peak Day, Connector Share)
      */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-5">
        {/* Metric 1: Total 30-Day Revenue */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
            isDark ? 'bg-[#07111F] border-[#243B56]' : 'bg-[#F7FAFC] border-[#DCE6F0]'
          }`}
        >
          <div className="text-[11px] font-medium text-[#64748B] dark:text-[#9FB1C5] mb-1">
            30-Day Total Revenue
          </div>
          <div className="text-lg sm:text-xl font-heading font-bold text-[#0F172A] dark:text-white tracking-tight">
            {currencySymbol}
            {total30DayRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] mt-1 flex items-center gap-1">
            <span>Across last 30 calendar days</span>
          </div>
        </div>

        {/* Metric 2: Daily Average Revenue */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
            isDark ? 'bg-[#07111F] border-[#243B56]' : 'bg-[#F7FAFC] border-[#DCE6F0]'
          }`}
        >
          <div className="text-[11px] font-medium text-[#64748B] dark:text-[#9FB1C5] mb-1">
            Daily Average
          </div>
          <div className="text-lg sm:text-xl font-heading font-bold text-[#2563EB] dark:text-[#60A5FA] tracking-tight">
            {currencySymbol}
            {dailyAverageRevenue.toLocaleString()}
            <span className="text-[10px] font-normal text-[#64748B] dark:text-[#9FB1C5]"> / day</span>
          </div>
          <div className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] mt-1">
            Mean daily operational intake
          </div>
        </div>

        {/* Metric 3: Peak Revenue Day */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
            isDark ? 'bg-[#07111F] border-[#243B56]' : 'bg-[#F7FAFC] border-[#DCE6F0]'
          }`}
        >
          <div className="text-[11px] font-medium text-[#64748B] dark:text-[#9FB1C5] mb-1 flex items-center justify-between">
            <span>Peak Day</span>
            {peakDay && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 font-bold">
                HIGH
              </span>
            )}
          </div>
          <div className="text-lg sm:text-xl font-heading font-bold text-[#0F172A] dark:text-white tracking-tight">
            {currencySymbol}
            {peakDay ? peakDay.totalRevenue.toLocaleString() : '0'}
          </div>
          <div className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] mt-1 truncate">
            {peakDay ? peakDay.fullFormattedDate : 'No recorded peaks'}
          </div>
        </div>

        {/* Metric 4: Connected Apps Contribution */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
            isDark ? 'bg-[#07111F] border-[#243B56]' : 'bg-[#F7FAFC] border-[#DCE6F0]'
          }`}
        >
          <div className="text-[11px] font-medium text-[#64748B] dark:text-[#9FB1C5] mb-1 flex items-center justify-between">
            <span>Connector Share</span>
            <Layers className="w-3 h-3 text-[#2563EB] dark:text-[#60A5FA]" />
          </div>
          <div className="text-lg sm:text-xl font-heading font-bold text-[#16A34A] dark:text-[#4ADE80] tracking-tight">
            {connectorRevenueShare}%
          </div>
          <div className="text-[10px] text-[#64748B] dark:text-[#9FB1C5] mt-1">
            {activeConnectors.length > 0
              ? `From ${activeConnectors.map((c) => c.provider.toUpperCase()).join(', ')}`
              : 'Sync apps to stream online sales'}
          </div>
        </div>
      </div>

      {/* 
        3. SOURCE FILTER CHIPS
      */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
        <span className="text-xs text-[#64748B] dark:text-[#9FB1C5] font-medium flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Channel:</span>
        </span>

        <button
          type="button"
          onClick={() => setSelectedSource('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            selectedSource === 'all'
              ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-xs'
              : isDark
              ? 'bg-[#132640] border border-[#243B56] text-[#D5E2F0] hover:text-white'
              : 'bg-white border border-[#DCE6F0] text-[#0F172A] hover:bg-slate-50'
          }`}
        >
          All Sources
        </button>

        {availableSources.map((sourceKey) => {
          const meta = CONNECTORS_REGISTRY[sourceKey as ConnectorProviderId];
          const label = meta ? meta.name : sourceKey === 'in-store' ? 'In-Store / Direct' : sourceKey.toUpperCase();
          const isSelected = selectedSource === sourceKey;

          return (
            <button
              key={sourceKey}
              type="button"
              onClick={() => setSelectedSource(sourceKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-xs'
                  : isDark
                  ? 'bg-[#132640] border border-[#243B56] text-[#D5E2F0] hover:text-white'
                  : 'bg-white border border-[#DCE6F0] text-[#0F172A] hover:bg-slate-50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: meta ? meta.brandColor : '#2563EB' }}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* 
        4. ACTIVE DAY INSPECTOR HUD (Highlights details of hovered or clicked day)
      */}
      <div
        className={`p-3.5 rounded-xl border mb-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDark ? 'bg-[#07111F]/80 border-[#243B56]' : 'bg-[#EAF2FF]/40 border-[#DCE6F0]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/20 text-[#2563EB] dark:text-[#60A5FA]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#0F172A] dark:text-white">
              {activeDay.fullFormattedDate}
              {activeDay.isToday && (
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#2563EB] text-white font-bold">
                  TODAY
                </span>
              )}
              {activeDay.isPeak && (
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-500 font-bold">
                  ★ PEAK DAY
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#9FB1C5] flex items-center gap-2 mt-0.5">
              <span>{activeDay.orderCount} transaction{activeDay.orderCount === 1 ? '' : 's'}</span>
              <span>•</span>
              <span className="font-semibold text-[#0F172A] dark:text-white font-mono">
                {currencySymbol}{activeDay.totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Source breakdown pills for the selected day */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {Object.keys(activeDay.bySource).length > 0 ? (
            Object.entries(activeDay.bySource).map(([srcKey, data]) => (
              <span
                key={srcKey}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                  isDark ? 'bg-[#0D1B2E] border-[#243B56]' : 'bg-white border-[#DCE6F0]'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                <span className="font-medium text-[#475569] dark:text-slate-300">{data.name}:</span>
                <span className="font-bold font-mono text-[#0F172A] dark:text-white">
                  {currencySymbol}{data.amount.toLocaleString()}
                </span>
              </span>
            ))
          ) : (
            <span className="text-[11px] text-[#64748B] dark:text-[#9FB1C5] italic">
              No sales recorded on this calendar day.
            </span>
          )}
        </div>
      </div>

      {/* 
        5. THE 30-DAY BAR CHART CONTAINER
      */}
      <div className="relative pt-6 pb-2">
        {/* Y-Axis Gridlines & Scale Labels */}
        <div className="absolute inset-0 top-6 bottom-8 pointer-events-none flex flex-col justify-between text-[10px] font-mono text-[#64748B] dark:text-[#9FB1C5]">
          <div className="border-b border-[#DCE6F0]/60 dark:border-[#243B56]/50 pb-0.5 flex justify-between">
            <span>{currencySymbol}{yAxisCeiling.toLocaleString()}</span>
            <span className="opacity-50">100%</span>
          </div>
          <div className="border-b border-dashed border-[#DCE6F0]/50 dark:border-[#243B56]/40 pb-0.5 flex justify-between">
            <span>{currencySymbol}{Math.round(yAxisCeiling * 0.75).toLocaleString()}</span>
            <span className="opacity-50">75%</span>
          </div>
          <div className="border-b border-dashed border-[#DCE6F0]/50 dark:border-[#243B56]/40 pb-0.5 flex justify-between">
            <span>{currencySymbol}{Math.round(yAxisCeiling * 0.5).toLocaleString()}</span>
            <span className="opacity-50">50%</span>
          </div>
          <div className="border-b border-dashed border-[#DCE6F0]/50 dark:border-[#243B56]/40 pb-0.5 flex justify-between">
            <span>{currencySymbol}{Math.round(yAxisCeiling * 0.25).toLocaleString()}</span>
            <span className="opacity-50">25%</span>
          </div>
          <div className="border-b border-[#DCE6F0] dark:border-[#243B56] flex justify-between">
            <span>{currencySymbol}0</span>
            <span className="opacity-50">Base</span>
          </div>
        </div>

        {/* Vertical Bars Stream */}
        <div className="relative z-10 h-52 sm:h-64 flex items-end justify-between gap-1 sm:gap-1.5 px-2">
          {timeline.map((day, idx) => {
            const heightPercent = day.totalRevenue > 0
              ? Math.max(6, Math.min(100, (day.totalRevenue / yAxisCeiling) * 100))
              : 0;

            const isHovered = hoveredDay?.dateStr === day.dateStr;
            const isSelected = selectedDay?.dateStr === day.dateStr;

            return (
              <div
                key={day.dateStr}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => setSelectedDay(day)}
                className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer relative"
              >
                {/* Floating Tooltip upon Hover */}
                {isHovered && (
                  <div className="absolute -top-14 z-30 pointer-events-none whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-[#0F172A] text-white text-[11px] shadow-xl border border-white/10 flex flex-col items-center">
                    <span className="font-bold font-mono">
                      {currencySymbol}{day.totalRevenue.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-300">
                      {day.dayOfWeek}, {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="w-2 h-2 bg-[#0F172A] rotate-45 -mb-1 mt-0.5" />
                  </div>
                )}

                {/* Star / Peak Indicator */}
                {day.isPeak && day.totalRevenue > 0 && (
                  <div className="mb-1 text-[10px] text-amber-500 font-bold animate-bounce">
                    ★
                  </div>
                )}

                {/* Animated Bar */}
                <div className="w-full flex items-end justify-center h-full">
                  {day.totalRevenue > 0 ? (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.015, ease: 'easeOut' }}
                      className={`w-full rounded-t-sm transition-all ${
                        isSelected
                          ? 'bg-[#1D4ED8] dark:bg-[#60A5FA] ring-2 ring-[#2563EB]'
                          : day.isPeak
                          ? 'bg-gradient-to-t from-[#2563EB] to-[#60A5FA] dark:from-[#3B82F6] dark:to-[#93C5FD]'
                          : isDark
                          ? 'bg-[#3B82F6] hover:bg-[#60A5FA]'
                          : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
                      } ${day.isToday ? 'border-t-2 border-white dark:border-amber-400' : ''}`}
                    />
                  ) : (
                    // Flat zero-activity indicator
                    <div
                      className={`w-full h-1 rounded-t-xs transition-colors ${
                        day.isToday
                          ? 'bg-[#2563EB] dark:bg-[#60A5FA]'
                          : isDark
                          ? 'bg-[#243B56]/50 group-hover:bg-[#3B82F6]/50'
                          : 'bg-slate-200 group-hover:bg-[#2563EB]/40'
                      }`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Dates Labels */}
        <div className="flex items-center justify-between pt-2 px-2 text-[10px] font-mono text-[#64748B] dark:text-[#9FB1C5] border-t border-[#DCE6F0] dark:border-[#243B56]">
          <span>{timeline[0]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span className="hidden sm:inline">{timeline[7]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span>{timeline[14]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span className="hidden sm:inline">{timeline[21]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span className="font-bold text-[#2563EB] dark:text-[#60A5FA]">
            Today ({timeline[timeline.length - 1]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
          </span>
        </div>
      </div>

      {/* 
        6. FOOTER: Sync status notes & quick manual entry
      */}
      <div className="mt-5 pt-4 border-t border-[#DCE6F0] dark:border-[#243B56] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B] dark:text-[#9FB1C5]">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {lastSyncTime ? `Last connector sync: ${lastSyncTime}` : 'Continuously streaming realtime updates'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onOpenRecordSale && (
            <button
              type="button"
              onClick={onOpenRecordSale}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Sale</span>
            </button>
          )}

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('transactions')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer"
            >
              <span>View Ledger</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
