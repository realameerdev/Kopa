import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Clock, Database, Layers } from 'lucide-react';
import { db } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';
import { ConnectorIcon } from './ConnectorIcons';

interface SyncLogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncLogsDrawer: React.FC<SyncLogsDrawerProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const logs = db.getSyncLogs();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`w-full max-w-md h-full flex flex-col border-l shadow-2xl ${
            isDark ? 'bg-[#0A1612] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-[#1C382E]/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-heading font-semibold text-base">Synchronization Logs</h3>
                <p className="text-xs text-[#69746F] dark:text-slate-400">
                  Audit trail of imported external records
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {logs.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Layers className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-[#69746F] dark:text-slate-400">
                  No synchronization events recorded yet. Connect a service and trigger a sync to populate logs.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ConnectorIcon provider={log.provider} className="w-4 h-4" />
                      <span className="font-semibold uppercase font-mono text-[11px] text-emerald-400">
                        {log.provider}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-slate-300 dark:text-slate-200 leading-relaxed text-[11px]">
                    {log.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-mono">
                    <span>Processed: {log.itemsProcessed}</span>
                    <span>Created: {log.itemsCreated}</span>
                    <span>Updated: {log.itemsUpdated}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
