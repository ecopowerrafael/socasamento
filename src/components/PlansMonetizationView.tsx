import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, Sparkles, Star, Loader2, RefreshCw, X } from 'lucide-react';

interface PlanItem {
  id?: number;
  title: string;
  isIncluded?: boolean;
  isFeatured?: boolean;
}

interface Plan {
  id: number;
  name: string;
  shortDescription?: string;
  isFree: boolean;
  monthlyPrice: string;
  annualPrice: string;
  annualMonthlyEquivalent?: string;
  annualSavingsAmount?: string;
  annualDiscountPercentage?: string;
  mainColor?: string;
  textColor?: string;
  buttonColor?: string;
  badgeText?: string;
  buttonText: string;
  buttonUrl?: string;
  isRecommended: boolean;
  isPremium: boolean;
  isFeatured: boolean;
  items?: PlanItem[];
}

interface PlansMonetizationViewProps {
  openMultiQuote?: () => void;
}

export const PlansMonetizationView: React.FC<PlansMonetizationViewProps> = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cycle, setCycle] = useState<'annual' | 'monthly'>('annual');

  const fetchPublicPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      if (data.success && Array.isArray(data.plans) && data.plans.length > 0) {
        setPlans(data.plans);
      } else {
        // Fallback default plans
        setPlans([
          {
            id: 1,
            name: 'Plano Gratuito',
            shortDescription: 'Ideal para quem está iniciando no mercado de casamentos.',
            isFree: true,
            monthlyPrice: '0.00',
            annualPrice: '0.00',
            buttonText: 'Cadastrar Grátis',
            isRecommended: false,
            isPremium: false,
            isFeatured: false,
            items: [
              { title: 'Perfil básico no diretório', isIncluded: true },
              { title: 'Até 10 fotos na galeria', isIncluded: true },
              { title: 'Links para redes sociais', isIncluded: true },
              { title: 'Recebimento de orçamentos simples', isIncluded: true },
            ],
          },
          {
            id: 2,
            name: 'Plano Destaque',
            shortDescription: 'Aumente seus fechamentos de contratos de casamentos.',
            isFree: false,
            monthlyPrice: '89.00',
            annualPrice: '890.00',
            annualMonthlyEquivalent: '74.16',
            annualSavingsAmount: '178.00',
            annualDiscountPercentage: '16.6',
            badgeText: 'Mais Recomendado',
            buttonText: 'Assinar Plano Destaque',
            isRecommended: true,
            isPremium: false,
            isFeatured: true,
            mainColor: '#C88E9B',
            items: [
              { title: 'Selo Verificado de Qualidade', isIncluded: true, isFeatured: true },
              { title: 'Galeria de fotos ILIMITADA', isIncluded: true },
              { title: 'Inclusão em cotações múltiplas da cidade', isIncluded: true },
              { title: 'CRM de leads com botão WhatsApp direto', isIncluded: true },
              { title: 'Prioridade no topo das buscas regionais', isIncluded: true },
            ],
          },
          {
            id: 3,
            name: 'Plano Premium',
            shortDescription: 'Para estúdios consagrados e cobertura estadual.',
            isFree: false,
            monthlyPrice: '189.00',
            annualPrice: '1890.00',
            annualMonthlyEquivalent: '157.50',
            annualSavingsAmount: '378.00',
            annualDiscountPercentage: '20.00',
            badgeText: 'Elite Guia',
            buttonText: 'Seja Estúdio Premium',
            isRecommended: false,
            isPremium: true,
            isFeatured: false,
            mainColor: '#5A4035',
            items: [
              { title: 'Tudo do Plano Destaque', isIncluded: true },
              { title: 'Posicionamento fixo na Home', isIncluded: true, isFeatured: true },
              { title: 'Selo Premium Dourado + Selo Verificado', isIncluded: true },
              { title: 'Publicação de casamentos reais no feed', isIncluded: true },
              { title: 'Suporte VIP e relatórios mensais', isIncluded: true },
            ],
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching public plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicPlans();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-semibold text-[#5A4035] border border-[#C88E9B]/30 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C7A86A]" />
          <span>Cadastre seu Estúdio no Maior Portal do Brasil</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#5A4035] leading-tight">
          Anuncie seu Estúdio para Milhares de Noivos Todos os Dias
        </h1>

        <p className="text-sm sm:text-base text-[#5A4035]/80">
          Posicione sua marca nas primeiras colocações das buscas para fotógrafos de casamento na sua região.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${cycle === 'monthly' ? 'text-[#5A4035]' : 'text-stone-400'}`}>
            Cobrança Mensal
          </span>

          <button
            onClick={() => setCycle(cycle === 'annual' ? 'monthly' : 'annual')}
            className="w-14 h-8 bg-rose-100 p-1 rounded-full border border-rose-200 transition-all flex items-center"
          >
            <div
              className={`w-6 h-6 rounded-full bg-[#C88E9B] shadow-sm transform transition-transform ${
                cycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>

          <span className={`text-xs font-bold flex items-center gap-1 ${cycle === 'annual' ? 'text-[#5A4035]' : 'text-stone-400'}`}>
            Cobrança Anual
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
              Economize até 20%
            </span>
          </span>
        </div>
      </div>

      {/* Plans Container */}
      {loading ? (
        <div className="p-16 text-center text-stone-500 space-y-3">
          <Loader2 className="w-8 h-8 text-[#C88E9B] animate-spin mx-auto" />
          <p className="text-sm font-medium">Carregando opções de planos comerciais...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan) => {
            const isDark = plan.isPremium || plan.mainColor === '#5A4035';
            const mPrice = parseFloat(plan.monthlyPrice || '0');
            const aPrice = parseFloat(plan.annualPrice || '0');
            const savings = parseFloat(plan.annualSavingsAmount || '0');

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 transition-all flex flex-col justify-between relative shadow-lg ${
                  isDark
                    ? 'bg-[#5A4035] text-white border border-[#C7A86A]'
                    : plan.isRecommended || plan.isFeatured
                    ? 'bg-white text-[#5A4035] border-2 border-[#C88E9B] scale-102 shadow-2xl'
                    : 'bg-white text-[#5A4035] border border-stone-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Badge text */}
                {plan.badgeText && (
                  <span
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md ${
                      isDark
                        ? 'bg-[#C7A86A] text-[#5A4035]'
                        : 'bg-[#C88E9B] text-white'
                    }`}
                  >
                    {plan.badgeText}
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className={`text-2xl font-serif font-bold ${isDark ? 'text-[#C7A86A]' : 'text-[#5A4035]'}`}>
                      {plan.name}
                    </h3>
                    {plan.shortDescription && (
                      <p className={`text-xs mt-1.5 ${isDark ? 'text-white/80' : 'text-stone-500'}`}>
                        {plan.shortDescription}
                      </p>
                    )}
                  </div>

                  {/* Pricing Display */}
                  <div className="my-6">
                    {plan.isFree ? (
                      <div>
                        <span className={`text-4xl font-serif font-bold ${isDark ? 'text-[#C7A86A]' : 'text-[#5A4035]'}`}>
                          R$ 0
                        </span>
                        <span className={`text-xs block mt-1 ${isDark ? 'text-white/60' : 'text-stone-400'}`}>
                          Para sempre gratuito
                        </span>
                      </div>
                    ) : cycle === 'annual' ? (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-serif font-bold ${isDark ? 'text-[#C7A86A]' : 'text-[#5A4035]'}`}>
                            R$ {parseFloat(plan.annualMonthlyEquivalent || (aPrice / 12).toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className={`text-xs ${isDark ? 'text-white/70' : 'text-stone-500'}`}>/mês</span>
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-stone-400'}`}>
                          Cobrado anualmente (R$ {aPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano)
                        </p>
                        {savings > 0 && (
                          <span className="inline-block mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Economia de R$ {savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no ano
                          </span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-serif font-bold ${isDark ? 'text-[#C7A86A]' : 'text-[#5A4035]'}`}>
                            R$ {mPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className={`text-xs ${isDark ? 'text-white/70' : 'text-stone-500'}`}>/mês</span>
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-stone-400'}`}>
                          Cobrança mensal recorrente
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <ul className="space-y-3 text-xs">
                    {(plan.items || []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        {item.isIncluded !== false ? (
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-[#C7A86A]' : 'text-[#C88E9B]'}`} />
                        ) : (
                          <X className="w-4 h-4 shrink-0 mt-0.5 text-stone-300" />
                        )}
                        <span className={item.isFeatured ? 'font-bold' : ''}>
                          {item.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-stone-100/20">
                  <button
                    onClick={() => {
                      if (plan.buttonUrl) {
                        window.location.href = plan.buttonUrl;
                      } else {
                        alert(`Plano '${plan.name}' selecionado! Em breve você será direcionado ao checkout seguro.`);
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-md transition-all text-center cursor-pointer ${
                      isDark
                        ? 'bg-[#C7A86A] hover:bg-[#b09355] text-[#5A4035]'
                        : plan.isRecommended || plan.isFeatured
                        ? 'bg-[#C88E9B] hover:bg-[#b07885] text-white'
                        : 'bg-stone-100 hover:bg-stone-200 text-[#5A4035]'
                    }`}
                  >
                    {plan.buttonText || 'Assinar Plano'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
