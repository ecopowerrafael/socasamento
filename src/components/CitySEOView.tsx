import React from 'react';
import { MapPin, Search, Star, Camera, ShieldCheck, Sparkles, Building2, HelpCircle } from 'lucide-react';
import { CitySEOData, Photographer, RecentWedding } from '../types';
import { PhotographerCard } from './PhotographerCard';

interface CitySEOViewProps {
  cityData: CitySEOData;
  photographers: Photographer[];
  recentWeddings: RecentWedding[];
  onViewProfile: (slug: string) => void;
  onOpenQuote: (photographer: Photographer) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
  openMultiQuote: () => void;
}

export const CitySEOView: React.FC<CitySEOViewProps> = ({
  cityData,
  photographers,
  recentWeddings,
  onViewProfile,
  onOpenQuote,
  favorites,
  onToggleFavorite,
  comparedIds,
  onToggleCompare,
  openMultiQuote,
}) => {
  // Photographers matching city or nearby
  const cityPhotographers = photographers.filter(
    (p) => p.city.toLowerCase() === cityData.city.toLowerCase() || p.state === cityData.state
  );

  const cityWeddings = recentWeddings.filter(
    (w) => w.city.toLowerCase() === cityData.city.toLowerCase()
  );

  return (
    <div className="space-y-10 pb-16">
      
      {/* SEO Hero Header */}
      <section className="bg-gradient-to-b from-[#5A4035] to-[#453027] text-white py-12 px-4 sm:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#C7A86A]/40 text-xs font-semibold text-[#C7A86A]">
            <Building2 className="w-4 h-4" />
            <span>Guia Oficial de Fotografia de Casamento em {cityData.city} - {cityData.state}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold leading-tight">
            {cityData.heroText}
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-3xl font-normal leading-relaxed">
            {cityData.seoDescription}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={openMultiQuote}
              className="px-6 py-3 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#C7A86A]" />
              <span>Solicitar Orçamento aos Fotógrafos de {cityData.city}</span>
            </button>
          </div>

        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* SEO Intro Text Content Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#5A4035]">
            Fotografia de Casamento em {cityData.city}: Dicas e Locais Incríveis
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4035]/90 leading-relaxed font-normal">
            {cityData.introText}
          </p>
        </div>

        {/* Photographers List in City */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C88E9B]/20 pb-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#5A4035]">
                Fotógrafos Recomendados em {cityData.city}
              </h2>
              <p className="text-xs text-[#5A4035]/70">
                {cityPhotographers.length} estúdios disponíveis para orçamento
              </p>
            </div>

            <button
              onClick={openMultiQuote}
              className="text-xs font-bold text-[#C88E9B] hover:underline"
            >
              Cotação Múltipla Rápida em {cityData.city} →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityPhotographers.map((p) => (
              <PhotographerCard
                key={p.id}
                photographer={p}
                onViewProfile={onViewProfile}
                onOpenQuote={onOpenQuote}
                isFavorite={favorites.includes(p.id)}
                onToggleFavorite={onToggleFavorite}
                isCompared={comparedIds.includes(p.id)}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </div>
        </div>

        {/* Recent Weddings Feed in City */}
        {cityWeddings.length > 0 && (
          <div className="space-y-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-[#5A4035] flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#C88E9B]" />
              <span>Últimos Casamentos Publicados em {cityData.city}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {cityWeddings.map((w) => (
                <div key={w.id} className="bg-[#FAF5F0] rounded-2xl overflow-hidden border border-[#C88E9B]/20 flex flex-col sm:flex-row">
                  <img src={w.coverImage} alt={w.title} className="w-full sm:w-48 h-48 object-cover" />
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#C88E9B]">{w.venue}</span>
                      <h3 className="font-serif font-bold text-sm text-[#5A4035] leading-tight">{w.title}</h3>
                      <p className="text-xs text-[#5A4035]/70 mt-1 line-clamp-2">{w.story}</p>
                    </div>

                    <div className="pt-2 border-t border-[#5A4035]/10 flex items-center justify-between text-xs font-semibold text-[#5A4035]">
                      <span>Fotógrafo: {w.photographerName}</span>
                      <button
                        onClick={() => onViewProfile(w.photographerSlug)}
                        className="text-[#C88E9B] hover:underline"
                      >
                        Ver Estúdio
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* City FAQ Accordion */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
          <h2 className="text-2xl font-serif font-bold text-[#5A4035] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#C88E9B]" />
            <span>Dúvidas Frequentes sobre Fotógrafos em {cityData.city}</span>
          </h2>

          <div className="space-y-4">
            {cityData.faq.map((f, i) => (
              <div key={i} className="bg-[#FAF5F0] p-5 rounded-2xl border border-[#5A4035]/10 space-y-2">
                <h3 className="font-bold text-sm text-[#5A4035] flex items-start gap-2">
                  <span className="text-[#C88E9B] font-serif font-bold">Q:</span>
                  <span>{f.question}</span>
                </h3>
                <p className="text-xs text-[#5A4035]/80 pl-5 leading-relaxed">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
