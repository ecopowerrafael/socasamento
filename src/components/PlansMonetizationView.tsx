import React from 'react';
import { ShieldCheck, Check, Sparkles, Star, Award, MessageSquare } from 'lucide-react';

interface PlansMonetizationViewProps {
  openMultiQuote: () => void;
}

export const PlansMonetizationView: React.FC<PlansMonetizationViewProps> = ({ openMultiQuote }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
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
          Posicione sua marca nas primeiras colocações das buscas do Google para fotógrafos de casamento na sua cidade.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* Plan 1: Gratuito */}
        <div className="bg-white rounded-3xl p-8 border border-[#5A4035]/15 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#5A4035]">Plano Gratuito</h3>
            <p className="text-xs text-[#5A4035]/70 mt-1">Ideal para quem está iniciando no mercado de casamento.</p>
            
            <div className="my-6">
              <span className="text-3xl font-serif font-bold text-[#5A4035]">R$ 0</span>
              <span className="text-xs text-[#5A4035]/60 block">Para sempre grátis</span>
            </div>

            <ul className="space-y-3 text-xs text-[#5A4035]">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C88E9B]" /> <span>Perfil básico no diretório</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C88E9B]" /> <span>Até 10 fotos na galeria</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C88E9B]" /> <span>Links para redes sociais</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C88E9B]" /> <span>Recebimento de orçamentos simples</span></li>
            </ul>
          </div>

          <button
            onClick={() => alert('Cadastro grátis efetuado! Acesse seu Painel do Fotógrafo.')}
            className="w-full py-3 bg-[#FAF5F0] hover:bg-[#F6EEE8] text-[#5A4035] font-bold text-xs rounded-xl border border-[#C88E9B]/30"
          >
            Cadastrar Grátis
          </button>
        </div>

        {/* Plan 2: Destaque */}
        <div className="bg-white rounded-3xl p-8 border-2 border-[#C88E9B] shadow-xl space-y-6 flex flex-col justify-between relative scale-102">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C88E9B] text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
            Mais Recomendado
          </span>

          <div>
            <h3 className="text-xl font-serif font-bold text-[#5A4035]">Plano Destaque</h3>
            <p className="text-xs text-[#5A4035]/70 mt-1">Aumente seus fechamentos de contratos na cidade.</p>
            
            <div className="my-6">
              <span className="text-4xl font-serif font-bold text-[#5A4035]">R$ 89</span>
              <span className="text-xs text-[#5A4035]/60 block">/mês ou R$ 890/ano</span>
            </div>

            <ul className="space-y-3 text-xs text-[#5A4035]">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C88E9B]" /> <strong>Selo Verificado de Qualidade</strong></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C88E9B]" /> <span>Galeria de fotos ILIMITADA</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C88E9B]" /> <span>Inclusão em cotações múltiplas da cidade</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C88E9B]" /> <span>CRM de leads com botão WhatsApp direto</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C88E9B]" /> <span>Prioridade no topo das buscas regionais</span></li>
            </ul>
          </div>

          <button
            onClick={() => alert('Plano Destaque selecionado! Entraremos em contato para ativação do Selo Verificado.')}
            className="w-full py-3.5 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Assinar Plano Destaque
          </button>
        </div>

        {/* Plan 3: Premium */}
        <div className="bg-[#5A4035] text-white rounded-3xl p-8 border border-[#C7A86A] shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#C7A86A]">Plano Premium / Elite</h3>
            <p className="text-xs text-white/80 mt-1">Para estúdios consagrados e cobertura estadual.</p>
            
            <div className="my-6">
              <span className="text-4xl font-serif font-bold text-[#C7A86A]">R$ 189</span>
              <span className="text-xs text-white/60 block">/mês</span>
            </div>

            <ul className="space-y-3 text-xs text-white/90">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C7A86A]" /> <span>Tudo do Plano Destaque</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C7A86A]" /> <strong>Posicionamento fixo na Home</strong></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C7A86A]" /> <span>Selo Premium Dourado + Selo Verificado</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C7A86A]" /> <span>Publicação de casamentos reais no feed</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C7A86A]" /> <span>Suporte VIP e relatórios mensais de cliques</span></li>
            </ul>
          </div>

          <button
            onClick={() => alert('Plano Premium selecionado! Bem-vindo ao time de Elite.')}
            className="w-full py-3.5 bg-[#C7A86A] hover:bg-[#b09355] text-[#5A4035] font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Seja Estúdio Premium
          </button>
        </div>

      </div>

    </div>
  );
};
