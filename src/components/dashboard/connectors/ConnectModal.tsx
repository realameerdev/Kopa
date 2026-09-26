import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Key,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ConnectorMetadata, ConnectorProviderId, ConnectorConnection } from '../../../lib/connectors/types';
import { ConnectorIcon } from './ConnectorIcons';
import { db } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';
import { ConnectorSyncEngine } from '../../../lib/connectors/syncEngine';

interface ConnectModalProps {
  connector: ConnectorMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onConnected?: (connection: ConnectorConnection) => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  connector,
  isOpen,
  onClose,
  onConnected,
}) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [grantedScopes, setGrantedScopes] = useState<string[]>([]);

  useEffect(() => {
    if (connector) {
      setFormData({});
      setErrorMessage(null);
      setSuccessMessage(null);
      setGrantedScopes(connector.scopes.map((s) => s.id));
    }
  }, [connector]);

  // Listen for popup postMessage from OAuth callback
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'KOPA_CONNECTOR_AUTH_SUCCESS' && connector) {
        if (event.data.provider === connector.id) {
          setIsSubmitting(true);
          setSuccessMessage(`Authorization verified with ${connector.name}!`);

          const connection: ConnectorConnection = {
            id: connector.id,
            userId: db.getActiveUserId() || 'default_user',
            provider: connector.id,
            status: 'connected',
            connectedAt: new Date().toISOString(),
            grantedScopes,
            hasStoredCredentials: true,
            accountInfo: event.data.accountInfo || {
              accountName: `Verified ${connector.name} Account`,
              email: 'connected-merchant@kopa.app',
            },
          };

          db.saveConnector(connection);

          // Trigger initial background sync
          try {
            const syncRes = await fetch(`/api/connectors/sync/${connector.id}`, {
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

          setIsSubmitting(false);
          if (onConnected) onConnected(connection);
          setTimeout(() => onClose(), 1200);
        }
      } else if (event.data?.type === 'KOPA_CONNECTOR_AUTH_ERROR' && connector) {
        setIsSubmitting(false);
        setErrorMessage(event.data.error || 'Authentication denied or failed by provider.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [connector, grantedScopes, onConnected, onClose]);

  if (!isOpen || !connector) return null;

  const handleOAuthConnect = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Fetch OAuth URL from backend
      const queryParams = new URLSearchParams();
      if (formData.storeDomain) queryParams.set('storeDomain', formData.storeDomain);
      if (formData.clientId) queryParams.set('clientId', formData.clientId);

      const urlRes = await fetch(`/api/connectors/oauth/url/${connector.id}?${queryParams.toString()}`);
      if (!urlRes.ok) {
        const errData = await urlRes.json().catch(() => ({}));
        throw new Error(errData.error || `Could not generate OAuth URL for ${connector.name}. Please configure Client ID.`);
      }

      const { url } = await urlRes.json();

      // 2. Open popup directly to OAuth Provider's URL
      const popup = window.open(
        url,
        `kopa_oauth_${connector.id}`,
        'width=650,height=750,status=no,toolbar=no,menubar=no'
      );

      if (!popup) {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site to complete authorization.');
      }

      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to initiate OAuth flow.');
    }
  };

  const handleDirectCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Validate required fields
    for (const req of connector.credentialRequirements) {
      if (req.required && !formData[req.key]?.trim()) {
        setIsSubmitting(false);
        setErrorMessage(`Field "${req.name}" is required.`);
        return;
      }
    }

    try {
      const res = await fetch(`/api/connectors/connect-credentials/${connector.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: db.getActiveUserId() || 'default_user',
          credentials: formData,
          grantedScopes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to verify credentials with ${connector.name}`);
      }

      const result = await res.json();
      setSuccessMessage(`Credentials verified and securely stored.`);

      const connection: ConnectorConnection = {
        id: connector.id,
        userId: db.getActiveUserId() || 'default_user',
        provider: connector.id,
        status: 'connected',
        connectedAt: new Date().toISOString(),
        grantedScopes,
        hasStoredCredentials: true,
        maskedIdentifier: result.maskedIdentifier,
        accountInfo: {
          accountName: `${connector.name} Connection`,
          phoneNumberId: formData.phoneNumberId,
          storeDomain: formData.storeDomain,
        },
      };

      db.saveConnector(connection);

      // Trigger initial real sync
      try {
        const syncRes = await fetch(`/api/connectors/sync/${connector.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: db.getActiveUserId() || 'default_user',
            clientCredentials: formData,
          }),
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.payload) {
            ConnectorSyncEngine.processSyncPayload(syncData.payload);
          }
        }
      } catch (syncErr) {
        console.warn('Initial sync warning:', syncErr);
      }

      setIsSubmitting(false);
      if (onConnected) onConnected(connection);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Credential validation failed.');
    }
  };

  const isOAuthFlow = connector.authType === 'oauth2' || connector.authType === 'oauth2_pkce';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
            isDark ? 'bg-[#0A1612] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#1C382E]/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <ConnectorIcon provider={connector.id} className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-semibold">
                  Connect {connector.name}
                </h2>
                <p className="text-xs text-[#69746F] dark:text-slate-400">
                  {connector.category.toUpperCase()} INTEGRATION
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Description */}
            <p className="text-xs sm:text-sm text-[#69746F] dark:text-slate-300 leading-relaxed">
              {connector.longDescription}
            </p>

            {/* Error / Success Alerts */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Scopes & Permissions to Grant */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#69746F] flex items-center justify-between">
                <span>Permissions to grant</span>
                <span className="text-[11px] text-emerald-400 font-normal">Granular scope control</span>
              </label>
              <div className="space-y-2">
                {connector.scopes.map((scope) => (
                  <div
                    key={scope.id}
                    className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                      isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white dark:text-slate-100">{scope.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/5">
                          {scope.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#69746F] dark:text-slate-400 mt-0.5">
                        {scope.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Credential Inputs or Store Domain */}
            <form onSubmit={handleDirectCredentialSubmit} className="space-y-3.5 pt-2">
              {connector.credentialRequirements.map((req) => (
                <div key={req.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold flex items-center gap-1">
                      <span>{req.name}</span>
                      {req.required && <span className="text-rose-400">*</span>}
                    </label>
                    {req.envVarName && (
                      <span className="text-[10px] font-mono text-[#69746F]">
                        env: {req.envVarName}
                      </span>
                    )}
                  </div>
                  <input
                    type={req.type}
                    value={formData[req.key] || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [req.key]: e.target.value }))}
                    placeholder={req.placeholder || `Enter ${req.name}`}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-[#08110F] border-[#1C382E] text-white placeholder:text-slate-600'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <p className="text-[11px] text-[#69746F] dark:text-slate-400">
                    {req.description}
                  </p>
                </div>
              ))}

              {/* Security Badge */}
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Credentials are transmitted over HTTPS and isolated to your UID. Secrets are never exposed to browser logs.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                {isOAuthFlow ? (
                  <button
                    type="button"
                    onClick={handleOAuthConnect}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold text-xs sm:text-sm hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <span>{isSubmitting ? 'Opening OAuth Window...' : `Authorize via ${connector.name}`}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold text-xs sm:text-sm hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <span>{isSubmitting ? 'Verifying Credentials...' : 'Verify & Save Connection'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
