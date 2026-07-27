import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Activity,
  Key,
  Globe,
  Lock,
  FileText,
  Eye,
  Settings,
  Server,
  Calendar,
  User,
  ArrowRight,
  ExternalLink,
  Sliders,
  AlertCircle,
  Clock,
  Terminal,
} from 'lucide-react';

interface SettingsData {
  id: number;
  provider: string;
  isEnabled: boolean;
  environment: 'TEST' | 'PRODUCTION';
  webhookPathToken: string;
  webhookUrls: {
    test: string;
    production: string;
  };
  testCredentials: {
    publicKeyConfigured: boolean;
    accessTokenConfigured: boolean;
    webhookSecretConfigured: boolean;
    maskedPublicKey: string;
    maskedAccessToken: string;
    maskedWebhookSecret: string;
  };
  productionCredentials: {
    publicKeyConfigured: boolean;
    accessTokenConfigured: boolean;
    webhookSecretConfigured: boolean;
    maskedPublicKey: string;
    maskedAccessToken: string;
    maskedWebhookSecret: string;
  };
  lastConnectionTestAt: string | null;
  lastConnectionTestStatus: string | null;
  lastConnectionTestMessage: string | null;
  lastWebhookReceivedAt: string | null;
  updatedAt: string | null;
}

export function AdminMercadoPagoSettings() {
  const [activeTab, setActiveTab] = useState<'config' | 'webhook' | 'diagnostics' | 'events' | 'logs'>('config');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [runningDiag, setRunningDiag] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Form states for credentials editing
  const [environment, setEnvironment] = useState<'TEST' | 'PRODUCTION'>('TEST');
  const [isEnabled, setIsEnabled] = useState(true);
  const [showConfirmEnvModal, setShowConfirmEnvModal] = useState(false);
  const [pendingEnv, setPendingEnv] = useState<'TEST' | 'PRODUCTION' | null>(null);

  // Editing mode toggles
  const [editingTestKeys, setEditingTestKeys] = useState(false);
  const [editingProdKeys, setEditingProdKeys] = useState(false);

  // Test credentials inputs
  const [testPublicKey, setTestPublicKey] = useState('');
  const [testAccessToken, setTestAccessToken] = useState('');
  const [testWebhookSecret, setTestWebhookSecret] = useState('');

  // Production credentials inputs
  const [prodPublicKey, setProdPublicKey] = useState('');
  const [prodAccessToken, setProdAccessToken] = useState('');
  const [prodWebhookSecret, setProdWebhookSecret] = useState('');

  // Diagnostics state
  const [diagnostics, setDiagnostics] = useState<any>(null);

  // Events state
  const [events, setEvents] = useState<any[]>([]);
  const [eventFilters, setEventFilters] = useState({ env: 'all', status: 'all', q: '' });
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Logs state
  const [logs, setLogs] = useState<any[]>([]);

  // Copy feedback state
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'diagnostics') {
      runDiagnostics();
    } else if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/payment-gateways/mercado-pago/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setEnvironment(data.settings.environment || 'TEST');
        setIsEnabled(data.settings.isEnabled ?? true);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao carregar configurações do Mercado Pago' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro de rede' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const body: any = {
        environment,
        isEnabled,
      };

      if (editingTestKeys) {
        if (testPublicKey) body.testPublicKey = testPublicKey;
        if (testAccessToken) body.testAccessToken = testAccessToken;
      }
      if (testWebhookSecret) body.testWebhookSecret = testWebhookSecret;

      if (editingProdKeys) {
        if (prodPublicKey) body.productionPublicKey = prodPublicKey;
        if (prodAccessToken) body.productionAccessToken = prodAccessToken;
      }
      if (prodWebhookSecret) body.productionWebhookSecret = prodWebhookSecret;

      const res = await fetch('/api/admin/payment-gateways/mercado-pago/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
        setEditingTestKeys(false);
        setEditingProdKeys(false);
        setTestPublicKey('');
        setTestAccessToken('');
        setProdPublicKey('');
        setProdAccessToken('');
        await fetchSettings();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar configurações' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConn(true);
      setMessage(null);
      const res = await fetch('/api/admin/payment-gateways/mercado-pago/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await fetchSettings();
      } else {
        setMessage({ type: 'error', text: data.message || 'Falha no teste de conexão com Mercado Pago' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setTestingConn(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!confirm('Deseja realmente regenerar o token da URL do Webhook? A URL anterior deixará de funcionar imediatamente.')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/payment-gateways/mercado-pago/regenerate-webhook-token', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Token da URL do Webhook regenerado com sucesso!' });
        await fetchSettings();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao regenerar token' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const runDiagnostics = async () => {
    try {
      setRunningDiag(true);
      const res = await fetch('/api/admin/payment-gateways/mercado-pago/diagnostics');
      const data = await res.json();
      if (data.success) {
        setDiagnostics(data);
      }
    } catch (err: any) {
      console.error('Error running diagnostics:', err);
    } finally {
      setRunningDiag(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (eventFilters.env !== 'all') queryParams.set('env', eventFilters.env);
      if (eventFilters.status !== 'all') queryParams.set('status', eventFilters.status);
      if (eventFilters.q) queryParams.set('q', eventFilters.q);

      const res = await fetch(`/api/admin/payment-gateways/mercado-pago/events?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
    }
  };

  const handleReprocessEvent = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/payment-gateways/mercado-pago/events/${id}/reprocess`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Evento #${id} reprocessado com sucesso!` });
        fetchEvents();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao reprocessar evento' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/payment-gateways/mercado-pago/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err: any) {
      console.error('Error fetching logs:', err);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-stone-500 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-[#C88E9B]" />
        <span>Carregando configurações da integração com Mercado Pago...</span>
      </div>
    );
  }

  const isProd = environment === 'PRODUCTION';
  const currentCreds = isProd ? settings?.productionCredentials : settings?.testCredentials;
  const isConfigured = Boolean(currentCreds?.publicKeyConfigured && currentCreds?.accessTokenConfigured);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-stone-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-64 h-64 bg-[#C88E9B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 text-[#C88E9B] text-xs font-semibold border border-stone-700">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Gateway Oficial de Pagamentos</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Integração com Mercado Pago
          </h2>
          <p className="text-stone-300 text-sm max-w-2xl">
            Gerencie cobranças recorrentes para fotógrafos no plano Premium, credenciais de teste e produção, webhooks e diagnóstico financeiro.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleTestConnection}
            disabled={testingConn}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-2 transition backdrop-blur-sm border border-white/10 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${testingConn ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span>{testingConn ? 'Testando Conexão...' : 'Testar Conexão'}</span>
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#C88E9B] hover:bg-[#b57a87] text-white font-semibold text-xs shadow-md flex items-center gap-2 transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* Global Status Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-start justify-between gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : message.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
            {message.type === 'info' && <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-stone-400 hover:text-stone-600 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-1">
        {[
          { id: 'config', label: '1. Configuração', icon: Settings },
          { id: 'webhook', label: '2. Webhook', icon: Globe },
          { id: 'diagnostics', label: '3. Diagnóstico', icon: Activity },
          { id: 'events', label: '4. Eventos Recebidos', icon: Terminal },
          { id: 'logs', label: '5. Logs de Auditoria', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 rounded-t-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap border-b-2 -mb-px ${
                isActive
                  ? 'border-[#C88E9B] text-[#C88E9B] bg-white font-semibold shadow-xs'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CONFIGURAÇÃO */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Environment Selector Card */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#C88E9B]" />
                  <span>Ambiente do Mercado Pago</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Alterne entre o ambiente isolado de testes (Sandbox) e o ambiente de produção real.
                </p>
              </div>

              {/* Status Badge */}
              <div
                className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                  isProd
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isProd ? 'bg-rose-600' : 'bg-amber-500'}`} />
                <span>{isProd ? 'MODO PRODUÇÃO (Cobranças Reais)' : 'MODO TESTES (Sandbox Activo)'}</span>
              </div>
            </div>

            {/* Radio options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  environment === 'TEST'
                    ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                    : 'border-stone-200 bg-stone-50 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="environment"
                  checked={environment === 'TEST'}
                  onChange={() => {
                    if (environment !== 'TEST') {
                      setPendingEnv('TEST');
                      setShowConfirmEnvModal(true);
                    }
                  }}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="font-bold text-stone-900 text-sm block">○ Testes (Sandbox)</span>
                  <p className="text-xs text-stone-500 mt-1">
                    Ideal para testar assinaturas, renovações e webhooks sem movimentar dinheiro real.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  environment === 'PRODUCTION'
                    ? 'border-rose-600 bg-rose-50/40 shadow-xs'
                    : 'border-stone-200 bg-stone-50 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="environment"
                  checked={environment === 'PRODUCTION'}
                  onChange={() => {
                    if (environment !== 'PRODUCTION') {
                      setPendingEnv('PRODUCTION');
                      setShowConfirmEnvModal(true);
                    }
                  }}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-bold text-stone-900 text-sm block">○ Produção</span>
                  <p className="text-xs text-stone-500 mt-1">
                    Processa cobranças de assinaturas reais no cartão de crédito/PIX dos fotógrafos.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Status Card */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>Status Atual da Integração ({environment})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Status Geral</span>
                <p className={`text-base font-bold ${isConfigured ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {isConfigured ? 'Pronta para Uso' : 'Incompleta'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Public Key</span>
                <p className="text-sm font-medium text-stone-800 truncate">
                  {currentCreds?.publicKeyConfigured ? currentCreds.maskedPublicKey : 'Não configurada'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Access Token</span>
                <p className="text-sm font-medium text-stone-800 truncate">
                  {currentCreds?.accessTokenConfigured ? currentCreds.maskedAccessToken : 'Não configurado'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Segredo Webhook</span>
                <p className="text-sm font-medium text-stone-800 truncate">
                  {currentCreds?.webhookSecretConfigured ? currentCreds.maskedWebhookSecret : 'Pendente'}
                </p>
              </div>
            </div>

            {settings?.lastConnectionTestAt && (
              <div className="text-xs text-stone-500 pt-2 flex items-center gap-2 border-t border-stone-100">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Última verificação de conexão em:{' '}
                  {new Date(settings.lastConnectionTestAt).toLocaleString('pt-BR')} — Status:{' '}
                  <strong className={settings.lastConnectionTestStatus === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-600'}>
                    {settings.lastConnectionTestStatus}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Test Credentials Block */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-amber-800 flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-600" />
                  <span>Credenciais de Teste (Sandbox)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Chaves de teste fornecidas pelo Mercado Pago Developer Console.
                </p>
              </div>

              <button
                onClick={() => setEditingTestKeys(!editingTestKeys)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition"
              >
                {editingTestKeys ? 'Cancelar Edição' : 'Substituir Credenciais'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Public Key de Teste</label>
                {editingTestKeys ? (
                  <input
                    type="text"
                    value={testPublicKey}
                    onChange={(e) => setTestPublicKey(e.target.value)}
                    placeholder="TEST-00000000-0000-0000-0000-000000000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <input
                    type="text"
                    disabled
                    value={settings?.testCredentials?.maskedPublicKey || 'Não configurada'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-mono text-stone-600"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Access Token de Teste</label>
                {editingTestKeys ? (
                  <input
                    type="password"
                    value={testAccessToken}
                    onChange={(e) => setTestAccessToken(e.target.value)}
                    placeholder="TEST-0000000000000000-000000-00000000000000000000000000000000-000000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <input
                    type="password"
                    disabled
                    value={settings?.testCredentials?.maskedAccessToken || 'Não configurado'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-mono text-stone-600"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Production Credentials Block */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-rose-600" />
                  <span>Credenciais de Produção</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Chaves de produção oficiais para cobrança real. Guardadas com criptografia AES-256-GCM.
                </p>
              </div>

              <button
                onClick={() => setEditingProdKeys(!editingProdKeys)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition"
              >
                {editingProdKeys ? 'Cancelar Edição' : 'Substituir Credenciais'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Public Key de Produção</label>
                {editingProdKeys ? (
                  <input
                    type="text"
                    value={prodPublicKey}
                    onChange={(e) => setProdPublicKey(e.target.value)}
                    placeholder="APP_USR-00000000-0000-0000-0000-000000000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-rose-500"
                  />
                ) : (
                  <input
                    type="text"
                    disabled
                    value={settings?.productionCredentials?.maskedPublicKey || 'Não configurada'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-mono text-stone-600"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Access Token de Produção</label>
                {editingProdKeys ? (
                  <input
                    type="password"
                    value={prodAccessToken}
                    onChange={(e) => setProdAccessToken(e.target.value)}
                    placeholder="APP_USR-0000000000000000-000000-00000000000000000000000000000000-000000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-rose-500"
                  />
                ) : (
                  <input
                    type="password"
                    disabled
                    value={settings?.productionCredentials?.maskedAccessToken || 'Não configurado'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-mono text-stone-600"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEBHOOK */}
      {activeTab === 'webhook' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#C88E9B]" />
                <span>URLs do Webhook Geradas pelo Sistema</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Copie as URLs abaixo e cadastre no painel Developer Console do Mercado Pago na opção Webhooks.
              </p>
            </div>

            {/* Test Webhook URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider">
                URL do Webhook (Ambiente de Testes)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={settings?.webhookUrls?.test || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 text-xs font-mono text-amber-900"
                />
                <button
                  onClick={() => copyToClipboard(settings?.webhookUrls?.test || '', 'testUrl')}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs flex items-center gap-1.5 transition flex-shrink-0"
                >
                  {copiedUrl === 'testUrl' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedUrl === 'testUrl' ? 'Copiada!' : 'Copiar URL'}</span>
                </button>
              </div>
            </div>

            {/* Production Webhook URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider">
                URL do Webhook (Ambiente de Produção)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={settings?.webhookUrls?.production || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/50 text-xs font-mono text-rose-900"
                />
                <button
                  onClick={() => copyToClipboard(settings?.webhookUrls?.production || '', 'prodUrl')}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold text-xs flex items-center gap-1.5 transition flex-shrink-0"
                >
                  {copiedUrl === 'prodUrl' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedUrl === 'prodUrl' ? 'Copiada!' : 'Copiar URL'}</span>
                </button>
              </div>
            </div>

            {/* Actions for Webhook */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleRegenerateToken}
                className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4 text-stone-500" />
                <span>Regenerar Token da URL</span>
              </button>
            </div>

            {/* Webhook Secret Inputs */}
            <div className="pt-4 border-t border-stone-200 space-y-4">
              <h4 className="text-sm font-bold text-stone-900">Assinatura Secreta do Webhook (x-signature)</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Segredo do Webhook de Teste
                  </label>
                  <input
                    type="password"
                    value={testWebhookSecret}
                    onChange={(e) => setTestWebhookSecret(e.target.value)}
                    placeholder={settings?.testCredentials?.maskedWebhookSecret || 'Cole a chave secreta gerada pelo Mercado Pago'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#C88E9B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Segredo do Webhook de Produção
                  </label>
                  <input
                    type="password"
                    value={prodWebhookSecret}
                    onChange={(e) => setProdWebhookSecret(e.target.value)}
                    placeholder={settings?.productionCredentials?.maskedWebhookSecret || 'Cole a chave secreta gerada pelo Mercado Pago'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-[#C88E9B]"
                  />
                </div>
              </div>
            </div>

            {/* Instructions box */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span>Instruções de Configuração no Mercado Pago:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-stone-700">
                <li>Acesse o Mercado Pago Developer Console → Suas Aplicações → Notificações / Webhooks.</li>
                <li>Copie a URL do webhook gerada acima para o seu ambiente desejado (Teste ou Produção).</li>
                <li>Marque os eventos: <code>assinaturas (preapproval)</code> e <code>pagamentos (payment)</code>.</li>
                <li>Copie a "Assinatura Secreta" fornecida pelo Mercado Pago e cole no campo acima.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNÓSTICO */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span>Diagnóstico Completo da Integração</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Verifique se todos os pré-requisitos técnicos e financeiros estão preenchidos.
                </p>
              </div>

              <button
                onClick={runDiagnostics}
                disabled={runningDiag}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${runningDiag ? 'animate-spin' : ''}`} />
                <span>Executar Diagnóstico</span>
              </button>
            </div>

            {diagnostics?.checklist ? (
              <div className="space-y-3">
                {diagnostics.checklist.map((item: any) => (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl border flex items-start gap-3 bg-stone-50 border-stone-200"
                  >
                    {item.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
                    {item.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                    {item.status === 'error' && <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />}

                    <div>
                      <p className="text-sm font-bold text-stone-900">{item.label}</p>
                      <p className="text-xs text-stone-600 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500">Executando verificações do sistema...</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EVENTOS */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-600" />
                <span>Histórico de Eventos de Webhook Recebidos</span>
              </h3>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <select
                  value={eventFilters.env}
                  onChange={(e) => setEventFilters({ ...eventFilters, env: e.target.value })}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-medium"
                >
                  <option value="all">Todos Ambientes</option>
                  <option value="TEST">Testes</option>
                  <option value="PRODUCTION">Produção</option>
                </select>

                <select
                  value={eventFilters.status}
                  onChange={(e) => setEventFilters({ ...eventFilters, status: e.target.value })}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-medium"
                >
                  <option value="all">Todos Status</option>
                  <option value="PROCESSED">Processado</option>
                  <option value="RECEIVED">Recebido</option>
                  <option value="FAILED">Falhou</option>
                </select>

                <button
                  onClick={fetchEvents}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atualizar</span>
                </button>
              </div>
            </div>

            {/* Events Table */}
            <div className="overflow-x-auto border border-stone-200 rounded-2xl">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">ID / Data</th>
                    <th className="px-4 py-3">Ambiente</th>
                    <th className="px-4 py-3">Tipo / Recurso</th>
                    <th className="px-4 py-3">Assinatura Header</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                        Nenhum evento de webhook registrado até o momento.
                      </td>
                    </tr>
                  ) : (
                    events.map((evt) => (
                      <tr key={evt.id} className="hover:bg-stone-50 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold text-stone-900">#{evt.id}</p>
                          <p className="text-[11px] text-stone-400">
                            {new Date(evt.receivedAt).toLocaleString('pt-BR')}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              evt.environment === 'PRODUCTION'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {evt.environment}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-stone-900">{evt.eventType}</p>
                          <p className="text-[11px] font-mono text-stone-500">
                            ID: {evt.externalResourceId || evt.externalEventId}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {evt.signatureValid ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Válida
                            </span>
                          ) : (
                            <span className="text-rose-600 font-semibold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Inválida
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              evt.processingStatus === 'PROCESSED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : evt.processingStatus === 'FAILED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {evt.processingStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => setSelectedEvent(evt)}
                            className="px-2.5 py-1 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium"
                          >
                            Visualizar
                          </button>
                          <button
                            onClick={() => handleReprocessEvent(evt.id)}
                            className="px-2.5 py-1 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 font-medium"
                          >
                            Reprocessar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-stone-700" />
              <span>Logs de Auditoria do Gateway</span>
            </h3>

            <div className="overflow-x-auto border border-stone-200 rounded-2xl">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Ação</th>
                    <th className="px-4 py-3">Administrador</th>
                    <th className="px-4 py-3">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                        Nenhum log de auditoria registrado ainda.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50">
                        <td className="px-4 py-3 font-mono text-stone-500">
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 font-bold text-stone-900">{log.action}</td>
                        <td className="px-4 py-3 font-medium text-stone-700">{log.adminName || 'Admin'}</td>
                        <td className="px-4 py-3 text-stone-500 font-mono text-[11px]">
                          {JSON.stringify(log.detailsJson || {})}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Environment Switch */}
      {showConfirmEnvModal && pendingEnv && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-stone-900">Confirmar Alteração de Ambiente</h3>

            <p className="text-stone-600 text-sm">
              Você está alterando o ambiente ativo para{' '}
              <strong className="text-stone-900">{pendingEnv === 'PRODUCTION' ? 'PRODUÇÃO' : 'TESTES (Sandbox)'}</strong>.
            </p>

            <p className="text-xs text-stone-500">
              {pendingEnv === 'PRODUCTION'
                ? 'Em modo Produção, as novas assinaturas gerarão cobranças reais nos cartões dos fotógrafos.'
                : 'Em modo Testes, nenhuma cobrança real será efetuada.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowConfirmEnvModal(false);
                  setPendingEnv(null);
                }}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setEnvironment(pendingEnv);
                  setShowConfirmEnvModal(false);
                  setPendingEnv(null);
                }}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold"
              >
                Confirmar e Alterar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-stone-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-stone-900">
                Detalhes do Evento #{selectedEvent.id}
              </h3>
              <button onClick={() => setSelectedEvent(null)} className="text-stone-400 hover:text-stone-700 font-bold">
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-stone-700">Tipo de Evento:</span>{' '}
                <span className="font-mono text-stone-900">{selectedEvent.eventType}</span>
              </div>

              <div>
                <span className="font-bold text-stone-700">Ambiente:</span>{' '}
                <span className="font-semibold text-stone-900">{selectedEvent.environment}</span>
              </div>

              <div>
                <span className="font-bold text-stone-700">Payload JSON:</span>
                <pre className="mt-1 p-3 rounded-xl bg-stone-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedEvent.payloadJson, null, 2)}
                </pre>
              </div>

              {selectedEvent.errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                  <strong>Erro:</strong> {selectedEvent.errorMessage}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-semibold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
