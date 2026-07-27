import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Clock,
  Calendar,
  User,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  ChevronRight,
  FileText
} from 'lucide-react';

export const AdminSubscriptionsManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalActive: 0,
    totalPending: 0,
    totalCancelled: 0,
    mrr: '0.00',
  });

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');

  // Modals state
  const [showManualModal, setShowManualModal] = useState(false);
  const [photographersList, setPhotographersList] = useState<any[]>([]);
  const [plansList, setPlansList] = useState<any[]>([]);

  // Manual Form
  const [manualPhotographerId, setManualPhotographerId] = useState('');
  const [manualPlanId, setManualPlanId] = useState('');
  const [manualBillingCycle, setManualBillingCycle] = useState<'MONTHLY' | 'YEARLY' | 'MANUAL'>('MONTHLY');
  const [manualStartsAt, setManualStartsAt] = useState('');
  const [manualEndsAt, setManualEndsAt] = useState('');
  const [manualAmount, setManualAmount] = useState('0.00');
  const [manualNotes, setManualNotes] = useState('');
  const [manualIsComplimentary, setManualIsComplimentary] = useState(false);
  const [savingManual, setSavingManual] = useState(false);

  // Action state (Suspend / Reactivate / Cancel / Chargeback / Refund)
  const [actionSub, setActionSub] = useState<any>(null);
  const [actionType, setActionType] = useState<'suspend' | 'reactivate' | 'cancel' | 'chargeback' | 'refund' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [compensateDays, setCompensateDays] = useState(true);
  const [cancelImmediately, setCancelImmediately] = useState(true);
  const [refundAmount, setRefundAmount] = useState('0.00');
  const [processingAction, setProcessingAction] = useState(false);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (planFilter !== 'all') params.append('planId', planFilter);
      if (cycleFilter !== 'all') params.append('billingCycle', cycleFilter);

      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setSubscriptions(data.subscriptions || []);
        setMetrics(data.metrics || {});
      }
    } catch (err) {
      console.error('Error fetching admin subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [photoRes, planRes] = await Promise.all([
        fetch('/api/photographers'),
        fetch('/api/plans'),
      ]);
      const photoData = await photoRes.json();
      const planData = await planRes.json();

      if (photoData.photographers) setPhotographersList(photoData.photographers);
      if (planData.plans) setPlansList(planData.plans);
    } catch (err) {
      console.error('Error fetching auxiliary data for admin:', err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchAuxiliaryData();
  }, [searchTerm, statusFilter, planFilter, cycleFilter]);

  const handleCreateManualSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhotographerId || !manualPlanId) return;

    setSavingManual(true);
    try {
      const res = await fetch('/api/admin/subscriptions/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photographerId: Number(manualPhotographerId),
          planId: Number(manualPlanId),
          billingCycle: manualBillingCycle,
          startsAt: manualStartsAt || undefined,
          endsAt: manualEndsAt || undefined,
          amount: parseFloat(manualAmount) || 0,
          notes: manualNotes,
          isComplimentary: manualIsComplimentary,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowManualModal(false);
        setManualPhotographerId('');
        setManualPlanId('');
        setManualNotes('');
        setManualIsComplimentary(false);
        await fetchSubscriptions();
      } else {
        alert(data.error || 'Erro ao criar assinatura manual.');
      }
    } catch (err) {
      alert('Erro de comunicação.');
    } finally {
      setSavingManual(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!actionSub || !actionType) return;

    setProcessingAction(true);
    try {
      let endpoint = '';
      let body: any = { reason: actionReason };

      if (actionType === 'suspend') {
        endpoint = `/api/admin/subscriptions/${actionSub.id}/suspend`;
      } else if (actionType === 'reactivate') {
        endpoint = `/api/admin/subscriptions/${actionSub.id}/reactivate`;
        body.compensateDays = compensateDays;
      } else if (actionType === 'cancel') {
        endpoint = `/api/admin/subscriptions/${actionSub.id}/cancel`;
        body.cancelImmediately = cancelImmediately;
      } else if (actionType === 'chargeback') {
        endpoint = `/api/admin/subscriptions/${actionSub.id}/chargeback`;
      } else if (actionType === 'refund') {
        endpoint = `/api/admin/subscriptions/refund`;
        body.photographerId = actionSub.photographerId;
        body.planId = actionSub.planId;
        body.amount = parseFloat(refundAmount) || 0;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setActionSub(null);
        setActionType(null);
        setActionReason('');
        await fetchSubscriptions();
      } else {
        alert(data.error || 'Erro ao executar ação.');
      }
    } catch (err) {
      alert('Erro de comunicação com o servidor.');
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <div className="space-y-8 p-6 sm:p-8 bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-stone-900">
            Gerenciamento de Assinaturas & Recorrência
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Controle completo do ciclo de vida, vigência, faturamento e ativações de planos dos fotógrafos.
          </p>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ativação Manual
        </button>
      </div>

      {/* Financial & Lifecycle Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">MRR (Recorrência Mensal)</span>
            <TrendingUp className="w-5 h-5 text-[#C88E9B]" />
          </div>
          <p className="text-2xl font-bold text-[#C88E9B]">R$ {metrics.mrr || '0.00'}</p>
          <p className="text-[11px] text-stone-400">Sem cortesias/gratuitos (Anual/12)</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">ARR (Recorrência Anual)</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">R$ {metrics.arr || '0.00'}</p>
          <p className="text-[11px] text-stone-400">Projeção de 12 meses (MRR × 12)</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Receita Recebida (Mês)</span>
            <CreditCard className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900">R$ {metrics.receivedRevenueMonth || '0.00'}</p>
          <p className="text-[11px] text-stone-400">Pagamentos aprovados no mês</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Assinaturas Ativas</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{metrics.totalActive || 0}</p>
          <p className="text-[11px] text-stone-400">Com vigência regular ativa</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cortesias / Parcerias</span>
            <User className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{metrics.totalComplimentary || 0}</p>
          <p className="text-[11px] text-stone-400">Isentas de receita recorrente</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Suspensas</span>
            <PauseCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700">{metrics.totalSuspended || 0}</p>
          <p className="text-[11px] text-stone-400">Pausadas para compensação</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Inadimplentes / Recusadas</span>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{metrics.totalRejectedPayments || 0}</p>
          <p className="text-[11px] text-stone-400">Pagamentos não aprovados</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">A Vencer (7 Dias)</span>
            <Clock className="w-5 h-5 text-stone-500" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{metrics.totalExpiringIn7Days || 0}</p>
          <p className="text-[11px] text-stone-400">Próximas do vencimento</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por fotógrafo, estúdio..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 focus:outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="ACTIVE">Ativas</option>
            <option value="CANCEL_SCHEDULED">Cancelamento Agendado</option>
            <option value="PENDING">Pendentes</option>
            <option value="SUSPENDED">Suspensas</option>
            <option value="CANCELLED">Canceladas</option>
            <option value="EXPIRED">Expiradas</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 focus:outline-none"
          >
            <option value="all">Todos os Planos</option>
            {plansList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 focus:outline-none"
          >
            <option value="all">Todos os Ciclos</option>
            <option value="MONTHLY">Mensal</option>
            <option value="YEARLY">Anual</option>
            <option value="MANUAL">Manual</option>
          </select>

          <button
            onClick={fetchSubscriptions}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-all"
            title="Atualizar Tabela"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-[#C88E9B]" />
            <span>Carregando assinaturas...</span>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Nenhuma assinatura encontrada com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Fotógrafo / Estúdio</th>
                  <th className="py-3.5 px-4">Plano</th>
                  <th className="py-3.5 px-4">Ciclo</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Vigência Ativa</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-stone-50/80 transition-all">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{sub.photographer?.name || 'Fotógrafo Desconhecido'}</div>
                      <div className="text-[11px] text-stone-400">{sub.photographer?.studioName || sub.photographer?.email || '-'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-stone-800">{sub.plan?.name || 'Plano Gratuito'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium text-[10px]">
                        {sub.billingCycle === 'YEARLY' ? 'Anual' : sub.billingCycle === 'MONTHLY' ? 'Mensal' : 'Manual'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sub.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'CANCEL_SCHEDULED'
                            ? 'bg-amber-100 text-amber-800'
                            : sub.status === 'SUSPENDED'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-500">
                      <div>De: {sub.startsAt ? new Date(sub.startsAt).toLocaleDateString('pt-BR') : '-'}</div>
                      <div>Até: {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR') : '-'}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {sub.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            setActionSub(sub);
                            setActionType('suspend');
                          }}
                          className="px-2.5 py-1 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 font-medium text-[11px]"
                        >
                          Suspender
                        </button>
                      )}

                      {sub.status === 'SUSPENDED' && (
                        <button
                          onClick={() => {
                            setActionSub(sub);
                            setActionType('reactivate');
                          }}
                          className="px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium text-[11px]"
                        >
                          Reativar
                        </button>
                      )}

                      {(sub.status === 'ACTIVE' || sub.status === 'CANCEL_SCHEDULED') && (
                        <button
                          onClick={() => {
                            setActionSub(sub);
                            setActionType('cancel');
                          }}
                          className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium text-[11px]"
                        >
                          Cancelar
                        </button>
                      )}

                      {(sub.status === 'ACTIVE' || sub.status === 'CANCEL_SCHEDULED' || sub.status === 'SUSPENDED') && (
                        <>
                          <button
                            onClick={() => {
                              setActionSub(sub);
                              setActionType('chargeback');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 font-medium text-[11px]"
                            title="Contestação de pagamento"
                          >
                            Chargeback
                          </button>

                          <button
                            onClick={() => {
                              setActionSub(sub);
                              setActionType('refund');
                              setRefundAmount(sub.plan?.monthlyPrice || '0.00');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 font-medium text-[11px]"
                            title="Estornar pagamento"
                          >
                            Estornar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Activation Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-serif font-medium text-stone-900">Ativação Manual de Assinatura</h3>

            <form onSubmit={handleCreateManualSubscription} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Fotógrafo *</label>
                <select
                  value={manualPhotographerId}
                  onChange={(e) => setManualPhotographerId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                >
                  <option value="">Selecione o fotógrafo...</option>
                  {photographersList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.studioName || p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Plano *</label>
                <select
                  value={manualPlanId}
                  onChange={(e) => setManualPlanId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none"
                >
                  <option value="">Selecione o plano...</option>
                  {plansList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - R$ {p.monthlyPrice}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Ciclo de Cobrança</label>
                  <select
                    value={manualBillingCycle}
                    onChange={(e: any) => setManualBillingCycle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  >
                    <option value="MONTHLY">Mensal</option>
                    <option value="YEARLY">Anual</option>
                    <option value="MANUAL">Manual / Cortesia</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Valor do Lançamento (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={manualStartsAt}
                    onChange={(e) => setManualStartsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Data Fim / Vencimento</label>
                  <input
                    type="date"
                    value={manualEndsAt}
                    onChange={(e) => setManualEndsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={manualIsComplimentary}
                    onChange={(e) => setManualIsComplimentary(e.target.checked)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                  />
                  <span>Conta Cortesia / Parceria (Não conta na receita de MRR)</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Observações Internas</label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  rows={2}
                  placeholder="Ex: Parceria comercial, migração manual, cortesia..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingManual}
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow transition-all disabled:opacity-50"
                >
                  {savingManual ? 'Gravando...' : 'Ativar Assinatura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Dialog Modal */}
      {actionSub && actionType && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="text-lg font-serif font-medium text-stone-900 uppercase tracking-wider">
              {actionType === 'suspend' && 'Suspender Assinatura'}
              {actionType === 'reactivate' && 'Reativar Assinatura'}
              {actionType === 'cancel' && 'Cancelar Assinatura'}
              {actionType === 'chargeback' && 'Registrar Chargeback / Contestação'}
              {actionType === 'refund' && 'Estornar Pagamento'}
            </h3>

            <p className="text-stone-600 text-sm">
              Fotógrafo: <span className="font-semibold text-stone-900">{actionSub.photographer?.name}</span>
            </p>

            {actionType === 'refund' && (
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Valor a Estornar (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>
            )}

            {actionType === 'chargeback' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-medium">
                O chargeback irá cancelar imediatamente a assinatura do fotógrafo, registrá-lo como inadimplente e remover os privilégios do plano Premium.
              </div>
            )}

            {actionType === 'reactivate' && (
              <label className="flex items-center gap-2 text-stone-700 font-medium">
                <input
                  type="checkbox"
                  checked={compensateDays}
                  onChange={(e) => setCompensateDays(e.target.checked)}
                  className="rounded text-stone-900"
                />
                <span>Compensar dias em que a conta esteve suspensa estendendo o vencimento</span>
              </label>
            )}

            {actionType === 'cancel' && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-stone-700 font-medium">
                  <input
                    type="radio"
                    name="cancelScope"
                    checked={cancelImmediately}
                    onChange={() => setCancelImmediately(true)}
                  />
                  <span>Cancelar Imediatamente (Retorno instantâneo ao Gratuito)</span>
                </label>

                <label className="flex items-center gap-2 text-stone-700 font-medium">
                  <input
                    type="radio"
                    name="cancelScope"
                    checked={!cancelImmediately}
                    onChange={() => setCancelImmediately(false)}
                  />
                  <span>Agendar Cancelamento para o fim da vigência</span>
                </label>
              </div>
            )}

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Motivo / Justificativa Administrativa</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
                placeholder="Informe a razão..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActionSub(null);
                  setActionType(null);
                }}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm"
              >
                Voltar
              </button>

              <button
                onClick={handleExecuteAction}
                disabled={processingAction}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow transition-all disabled:opacity-50"
              >
                {processingAction ? 'Processando...' : 'Confirmar Ação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
