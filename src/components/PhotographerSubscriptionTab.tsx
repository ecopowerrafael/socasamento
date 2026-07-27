import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  XCircle,
  FileText,
  Calendar,
  Zap,
  ArrowRight,
  ChevronRight,
  Check,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Photographer } from '../types';

interface PhotographerSubscriptionTabProps {
  photographer: Photographer;
  onUpdatePhotographer?: (p: Photographer) => void;
}

export const PhotographerSubscriptionTab: React.FC<PhotographerSubscriptionTabProps> = ({
  photographer,
  onUpdatePhotographer,
}) => {
  const [loading, setLoading] = useState(true);
  const [effectiveData, setEffectiveData] = useState<any>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [plansList, setPlansList] = useState<any[]>([]);

  // Simulation Form state
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');
  const [simulationOutcome, setSimulationOutcome] = useState<'APPROVED' | 'PENDING' | 'REJECTED' | 'REFUNDED'>('APPROVED');
  const [paymentMethod, setPaymentMethod] = useState<string>('PIX');
  const [installments, setInstallments] = useState<number>(1);
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Cancellation state
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch(`/api/photographer/subscription?photographerId=${photographer.id}`),
        fetch('/api/plans'),
      ]);

      const subData = await subRes.json();
      const plansData = await plansRes.json();

      if (subData.success) {
        setEffectiveData(subData.effectivePlan);
        setHistoryList(subData.history || []);
        setPaymentsList(subData.payments || []);
      }

      if (plansData.success) {
        setPlansList(plansData.plans || []);
        // Default selected plan to first paid plan or current plan
        const paidPlan = plansData.plans.find((p: any) => !p.isFree && p.planType !== 'FREE');
        if (paidPlan) setSelectedPlanId(paidPlan.id);
      }
    } catch (err) {
      console.error('Error fetching subscription tab data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [photographer.id]);

  const handleSimulateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    setSimulating(true);
    setSimMessage(null);

    try {
      const res = await fetch('/api/photographer/subscription/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photographerId: photographer.id,
          planId: selectedPlanId,
          billingCycle,
          simulationOutcome,
          paymentMethod,
          installments,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSimMessage({
          type: data.status === 'APPROVED' ? 'success' : data.status === 'PENDING' ? 'warning' : 'success',
          text: data.message,
        });

        // Refresh subscription data
        await fetchSubscriptionData();

        // Update photographer state if plan changed
        if (data.status === 'APPROVED' && onUpdatePhotographer) {
          const newPlan = plansList.find((p) => p.id === selectedPlanId);
          if (newPlan) {
            onUpdatePhotographer({ ...photographer, plan: newPlan.name });
          }
        }
      } else {
        setSimMessage({
          type: 'error',
          text: data.error || data.message || 'Falha na simulação.',
        });
      }
    } catch (err: any) {
      setSimMessage({ type: 'error', text: err?.message || 'Erro ao comunicar com o servidor.' });
    } finally {
      setSimulating(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const res = await fetch('/api/photographer/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photographerId: photographer.id,
          reason: cancelReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowCancelModal(false);
        setCancelReason('');
        await fetchSubscriptionData();
      } else {
        alert(data.error || 'Erro ao cancelar.');
      }
    } catch (err) {
      alert('Erro de conexão ao solicitar cancelamento.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivateCancellation = async () => {
    try {
      const res = await fetch('/api/photographer/subscription/reactivate-cancellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photographerId: photographer.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchSubscriptionData();
      } else {
        alert(data.error || 'Erro ao reativar renovação.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-stone-500 flex items-center justify-center gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-[#C88E9B]" />
        <span>Carregando dados da assinatura...</span>
      </div>
    );
  }

  const currentPlan = effectiveData?.plan;
  const currentSub = effectiveData?.subscription;
  const permissions = effectiveData?.permissions || {};
  const isFree = effectiveData?.isFree;
  const effectiveStatus = effectiveData?.effectiveStatus;

  const targetPlan = plansList.find((p) => p.id === selectedPlanId);

  // Price calculation
  const planMonthlyPrice = targetPlan ? parseFloat(targetPlan.monthlyPrice || '0') : 0;
  const planAnnualPrice = targetPlan ? parseFloat(targetPlan.annualPrice || '0') : 0;
  const annualMonthlyEquiv = targetPlan ? parseFloat(targetPlan.annualMonthlyEquivalent || (planAnnualPrice / 12).toString()) : 0;
  const annualSavings = (planMonthlyPrice * 12) - planAnnualPrice;

  return (
    <div className="space-y-8">
      {/* Current Active Plan Status Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C88E9B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#C88E9B] text-white">
                {isFree ? 'Plano Atual: Gratuito' : `Plano Ativo: ${currentPlan?.name}`}
              </span>

              {currentSub && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentSub.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : currentSub.status === 'CANCEL_SCHEDULED'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {currentSub.status === 'ACTIVE'
                    ? 'Ativo'
                    : currentSub.status === 'CANCEL_SCHEDULED'
                    ? 'Cancelamento Agendado'
                    : currentSub.status}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-stone-100 font-medium">
              {currentPlan?.name || 'Plano Gratuito'}
            </h2>

            <p className="text-stone-300 text-sm max-w-xl">
              {currentPlan?.shortDescription || 'Aproveite os recursos disponíveis para o seu cadastro no diretório.'}
            </p>

            {currentSub && (
              <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#C88E9B]" />
                  Início: {currentSub.startsAt ? new Date(currentSub.startsAt).toLocaleDateString('pt-BR') : '-'}
                </span>

                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C88E9B]" />
                  Vencimento do Período: {currentSub.currentPeriodEnd ? new Date(currentSub.currentPeriodEnd).toLocaleDateString('pt-BR') : '-'}
                </span>

                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-[#C88E9B]" />
                  Ciclo: {currentSub.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {!isFree && currentSub?.status === 'ACTIVE' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2.5 rounded-xl border border-stone-600 hover:border-rose-400 hover:text-rose-300 text-stone-300 text-sm font-medium transition-all"
              >
                Solicitar Cancelamento
              </button>
            )}

            {!isFree && currentSub?.status === 'CANCEL_SCHEDULED' && (
              <button
                onClick={handleReactivateCancellation}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-medium text-sm hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Manter Assinatura
              </button>
            )}

            {isFree && (
              <a
                href="#simular-upgrade"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C88E9B] to-[#b07583] text-white font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Fazer Upgrade para Premium
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5F0] text-[#5A4035] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#C88E9B]" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-medium text-stone-900">Permissões e Limites Ativos do seu Plano</h3>
            <p className="text-xs text-stone-500">
              Todas as capacidades abaixo são validadas em tempo real pelo sistema central de regras.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 mt-0.5 ${permissions.gallery_photos_limit === -1 ? 'text-emerald-600' : 'text-amber-600'}`} />
            <div>
              <p className="text-xs text-stone-500">Limite de Fotos na Galeria</p>
              <p className="text-sm font-semibold text-stone-800">
                {permissions.gallery_photos_limit === -1 ? 'Ilimitadas' : `${permissions.gallery_photos_limit || 10} fotos`}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 mt-0.5 ${permissions.monthly_leads_limit === -1 ? 'text-emerald-600' : 'text-amber-600'}`} />
            <div>
              <p className="text-xs text-stone-500">Leads de Noivas por Mês</p>
              <p className="text-sm font-semibold text-stone-800">
                {permissions.monthly_leads_limit === -1 ? 'Ilimitados' : `${permissions.monthly_leads_limit || 5} contatos`}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 mt-0.5 ${permissions.service_cities_limit === -1 ? 'text-emerald-600' : 'text-amber-600'}`} />
            <div>
              <p className="text-xs text-stone-500">Cidades de Atuação</p>
              <p className="text-sm font-semibold text-stone-800">
                {permissions.service_cities_limit === -1 ? 'Múltiplas / Ilimitadas' : `${permissions.service_cities_limit || 1} cidade`}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 mt-0.5 ${permissions.verified_badge ? 'text-emerald-600' : 'text-stone-400'}`} />
            <div>
              <p className="text-xs text-stone-500">Selo Verificado</p>
              <p className="text-sm font-semibold text-stone-800">
                {permissions.verified_badge ? 'Ativado' : 'Não Incluído'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 mt-0.5 ${permissions.whatsapp_direct ? 'text-emerald-600' : 'text-stone-400'}`} />
            <div>
              <p className="text-xs text-stone-500">WhatsApp Direto na Página</p>
              <p className="text-sm font-semibold text-stone-800">
                {permissions.whatsapp_direct ? 'Habilitado' : 'Apenas Formulário'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 mt-0.5 ${permissions.search_priority ? 'text-emerald-600' : 'text-stone-400'}`} />
            <div>
              <p className="text-xs text-stone-500">Prioridade nas Buscas</p>
              <p className="text-sm font-semibold text-stone-800">
                {permissions.search_priority ? 'Alta Prioridade' : 'Ordenação Padrão'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation / Checkout Section */}
      <div id="simular-upgrade" className="bg-stone-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-stone-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#C88E9B]/20 text-[#C88E9B] flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-medium text-stone-100">
              Contratação & Simulação de Pagamento de Assinatura
            </h3>
            <p className="text-xs text-stone-400">
              Escolha o plano e simule a confirmação do pagamento para testar a transição imediata da sua conta.
            </p>
          </div>
        </div>

        {simMessage && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3 ${
              simMessage.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : simMessage.type === 'warning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {simMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{simMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSimulateCheckout} className="space-y-6">
          {/* Plan Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              1. Selecione o Plano Desejado
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plansList
                .filter((p) => !p.isFree && p.planType !== 'FREE')
                .map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-[#C88E9B] bg-[#C88E9B]/10 shadow-lg'
                          : 'border-stone-800 bg-stone-800/50 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif text-lg text-white font-medium">{plan.name}</span>
                        {plan.isRecommended && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#C88E9B] text-white font-bold">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mb-4">{plan.shortDescription}</p>
                      <div className="text-stone-300 text-xs">
                        <p>
                          <span className="text-xl font-bold text-white">R$ {parseFloat(plan.monthlyPrice || '0').toFixed(2)}</span> /mês
                        </p>
                        <p className="text-stone-400">
                          ou R$ {parseFloat(plan.annualPrice || '0').toFixed(2)} /ano (Economia de R$ {((parseFloat(plan.monthlyPrice || '0')*12) - parseFloat(plan.annualPrice || '0')).toFixed(2)})
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Billing Cycle Switch */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              2. Periodicidade do Ciclo de Cobrança
            </label>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <button
                type="button"
                onClick={() => setBillingCycle('YEARLY')}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center ${
                  billingCycle === 'YEARLY'
                    ? 'border-[#C88E9B] bg-[#C88E9B]/20 text-white font-bold'
                    : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>Anual (Melhor Valor)</span>
                <span className="text-[10px] text-emerald-400 font-normal">Economize mais de 20%</span>
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center ${
                  billingCycle === 'MONTHLY'
                    ? 'border-[#C88E9B] bg-[#C88E9B]/20 text-white font-bold'
                    : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>Mensal</span>
                <span className="text-[10px] text-stone-400 font-normal">Sem fidelidade</span>
              </button>
            </div>
          </div>

          {/* Checkout Summary Box */}
          {targetPlan && (
            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/80 space-y-2 text-sm">
              <div className="flex justify-between text-stone-300">
                <span>Plano selecionado:</span>
                <span className="font-semibold text-white">{targetPlan.name} ({billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'})</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>Valor total a pagar:</span>
                <span className="font-bold text-[#C88E9B] text-lg">
                  R$ {billingCycle === 'YEARLY' ? planAnnualPrice.toFixed(2) : planMonthlyPrice.toFixed(2)}
                </span>
              </div>
              {billingCycle === 'YEARLY' && annualSavings > 0 && (
                <p className="text-xs text-emerald-400 pt-1">
                  ✨ Você economiza R$ {annualSavings.toFixed(2)} contratando no plano anual em comparação ao plano mensal!
                </p>
              )}
            </div>
          )}

          {/* Payment Method & Simulation Outcome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Método de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:border-[#C88E9B]"
              >
                <option value="PIX">Pix Instantâneo</option>
                <option value="CREDIT_CARD">Cartão de Crédito</option>
                <option value="BOLETO">Boleto Bancário</option>
                <option value="SIMULATION">Simulação Interna</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Resultado do Teste / Simulação
              </label>
              <select
                value={simulationOutcome}
                onChange={(e: any) => setSimulationOutcome(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:border-[#C88E9B]"
              >
                <option value="APPROVED">✅ Pagamento Aprovado (Ativação Imediata)</option>
                <option value="PENDING">⏳ Pagamento Pendente em Análise</option>
                <option value="REJECTED">❌ Pagamento Recusado pelo Banco</option>
                <option value="REFUNDED">↩️ Pagamento Estornado (Retorno ao Gratuito)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={simulating || !selectedPlanId}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C88E9B] to-[#b07583] hover:from-[#b07583] hover:to-[#965c69] text-white font-semibold text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {simulating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processando Simulação...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Confirmar Simulação de Pagamento
              </>
            )}
          </button>
        </form>
      </div>

      {/* History & Payment Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Records */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <h3 className="text-base font-serif font-medium text-stone-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C88E9B]" />
            Histórico de Pagamentos
          </h3>

          {paymentsList.length === 0 ? (
            <p className="text-xs text-stone-400 py-4 text-center">Nenhum pagamento registrado até o momento.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {paymentsList.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-stone-800">R$ {parseFloat(p.amount || '0').toFixed(2)}</span>
                    <span className="text-stone-400 ml-2">({p.paymentMethod || 'Simulação'})</span>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString('pt-BR') : '-'}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log / Subscription Events */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <h3 className="text-base font-serif font-medium text-stone-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C88E9B]" />
            Histórico de Eventos da Assinatura
          </h3>

          {historyList.length === 0 ? (
            <p className="text-xs text-stone-400 py-4 text-center">Nenhum evento registrado ainda.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {historyList.map((h) => (
                <div key={h.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-800">{h.eventType}</span>
                    <span className="text-[10px] text-stone-400">
                      {h.createdAt ? new Date(h.createdAt).toLocaleString('pt-BR') : '-'}
                    </span>
                  </div>
                  <p className="text-stone-600 text-[11px]">{h.reason || 'Sem observações'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-xl font-serif font-medium text-stone-900">Confirmar Cancelamento</h3>
            </div>

            <p className="text-sm text-stone-600">
              Sua assinatura permanecerá ativa até o final do período atual ({currentSub?.currentPeriodEnd ? new Date(currentSub.currentPeriodEnd).toLocaleDateString('pt-BR') : 'vencimento'}).
              Após essa data, você não será cobrado novamente e seu perfil retornará ao Plano Gratuito.
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Motivo do Cancelamento (opcional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Conte-nos por que está cancelando..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#C88E9B]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm font-medium"
              >
                Voltar
              </button>

              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
