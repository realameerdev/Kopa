import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Key,
} from 'lucide-react';
import { CONNECTORS_REGISTRY } from '../../../lib/connectors/registry';
import { ConnectorIcon } from './ConnectorIcons';
import { ConnectorProviderId } from '../../../lib/connectors/types';
import { useTheme } from '../../../context/ThemeContext';

interface DeveloperChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperChecklistModal: React.FC<DeveloperChecklistModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isDark } = useTheme();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ConnectorProviderId>('shopify');
  const [checklistData, setChecklistData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/api/connectors/config-checklist')
        .then((res) => res.json())
        .then((data) => {
          setChecklistData(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  const currentMeta = CONNECTORS_REGISTRY[selectedProvider];
  const currentChecklist = checklistData?.connectors?.find((c: any) => c.id === selectedProvider);
  const currentRedirectUri = currentChecklist?.redirectUri || `${window.location.origin}/auth/callback/${selectedProvider}`;
  const currentWebhookUri = currentChecklist?.webhookUri || `${window.location.origin}/api/connectors/webhooks/${selectedProvider}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
            isDark ? 'bg-[#07111F] border-[#243B56] text-white' : 'bg-white border-[#DCE6F0] text-[#0F172A]'
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#DCE6F0] dark:border-[#243B56]/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA]">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-semibold text-[#0F172A] dark:text-white">
                  Developer Configuration Checklist
                </h2>
                <p className="text-xs text-[#475569] dark:text-slate-400">
                  Exact OAuth Redirect URIs, Webhooks, and API Credentials required for real integration
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
            {/* Sidebar list of 10 connectors */}
            <div className={`md:col-span-4 border-b md:border-b-0 md:border-r border-[#DCE6F0] dark:border-[#243B56]/50 p-3 overflow-y-auto max-h-36 md:max-h-[70vh] space-y-1.5 ${
              isDark ? 'bg-[#0D1B2E]' : 'bg-slate-50'
            }`}>
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#475569] dark:text-slate-400">
                10 Integrated Platforms
              </div>
              {Object.values(CONNECTORS_REGISTRY).map((meta) => {
                const isSelected = selectedProvider === meta.id;
                const status = checklistData?.connectors?.find((c: any) => c.id === meta.id);
                return (
                  <button
                    key={meta.id}
                    onClick={() => setSelectedProvider(meta.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-[#2563EB]/20 border border-[#3B82F6]/50 text-[#60A5FA]'
                          : 'bg-blue-50 border border-blue-300 text-[#2563EB]'
                        : isDark
                        ? 'hover:bg-white/5 text-slate-300'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ConnectorIcon provider={meta.id} className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-medium truncate">{meta.name}</span>
                    </div>
                    {status?.allRequiredConfigured ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-mono">
                        <Key className="w-3 h-3" /> Needs setup
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main Detail Area */}
            <div className="md:col-span-8 p-5 overflow-y-auto max-h-[70vh] space-y-5">
              {/* Connector Title & Portal Link */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE6F0] dark:border-[#243B56]/40">
                <div className="flex items-center gap-3">
                  <ConnectorIcon provider={currentMeta.id} className="w-7 h-7" />
                  <div>
                    <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">{currentMeta.name}</h3>
                    <p className="text-xs text-[#475569] dark:text-slate-400">
                      Auth Method: <span className="font-mono text-[#2563EB] dark:text-[#60A5FA]">{currentMeta.authType.toUpperCase()}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={currentMeta.developerPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA] hover:bg-[#2563EB]/20 border border-[#2563EB]/30 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <span>Open Developer Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 1. Redirect URI */}
              {currentMeta.authType !== 'api_key_or_token' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-slate-400 flex items-center justify-between">
                    <span>Authorized OAuth Redirect URI</span>
                    <span className="text-[11px] text-[#2563EB] dark:text-[#60A5FA] font-normal">Add this exact URL to your App console</span>
                  </label>
                  <div className={`flex items-center justify-between p-2.5 rounded-xl border font-mono text-xs ${
                    isDark ? 'bg-[#040914] border-[#243B56] text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}>
                    <span className="truncate pr-2">{currentRedirectUri}</span>
                    <button
                      onClick={() => copyToClipboard(currentRedirectUri, 'redirect_uri')}
                      className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                      title="Copy Redirect URI"
                    >
                      {copiedKey === 'redirect_uri' ? <Check className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Webhook Endpoint */}
              {currentMeta.webhookSupported && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-slate-400 flex items-center justify-between">
                    <span>Webhook Listener URL</span>
                    <span className="text-[11px] text-[#2563EB] dark:text-[#60A5FA] font-normal">For real-time event updates</span>
                  </label>
                  <div className={`flex items-center justify-between p-2.5 rounded-xl border font-mono text-xs ${
                    isDark ? 'bg-[#040914] border-[#243B56] text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}>
                    <span className="truncate pr-2">{currentWebhookUri}</span>
                    <button
                      onClick={() => copyToClipboard(currentWebhookUri, 'webhook_uri')}
                      className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                      title="Copy Webhook URL"
                    >
                      {copiedKey === 'webhook_uri' ? <Check className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Required Scopes & Permissions */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-slate-400">
                  Required Scopes & Permissions
                </label>
                <div className="space-y-1.5">
                  {currentMeta.scopes.map((scope) => (
                    <div
                      key={scope.id}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                        isDark ? 'bg-[#0D1B2E] border-[#243B56]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#0F172A] dark:text-slate-100">{scope.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-black/5 dark:border-white/10">
                            {scope.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#475569] dark:text-slate-400 mt-0.5">
                          {scope.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Credentials Checklist */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-slate-400">
                  Required Credentials Checklist
                </label>
                <div className="space-y-2">
                  {currentMeta.credentialRequirements.map((req) => (
                    <div
                      key={req.key}
                      className={`p-3 rounded-xl border text-xs ${
                        isDark ? 'bg-[#0D1B2E] border-[#243B56]' : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold flex items-center gap-1.5 text-[#0F172A] dark:text-white">
                          <span>{req.name}</span>
                          {req.required && <span className="text-rose-500 text-[10px]">(Required)</span>}
                        </div>
                        {req.envVarName && (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#60A5FA] border border-[#2563EB]/30 dark:border-[#60A5FA]/30">
                            {req.envVarName}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#475569] dark:text-slate-400 mt-1">
                        {req.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-[#DCE6F0] dark:border-[#243B56]/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#475569] dark:text-slate-400">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>All connectors communicate directly with official service APIs. Secrets remain server-side.</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white font-semibold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
