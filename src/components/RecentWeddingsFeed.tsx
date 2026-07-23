import React, { useState } from 'react';
import { Camera, MapPin, Heart, Sparkles, X, ChevronRight } from 'lucide-react';
import { RecentWedding } from '../types';

interface RecentWeddingsFeedProps {
  weddings: RecentWedding[];
  onViewPhotographerProfile: (slug: string) => void;
  openMultiQuote: () => void;
}

export const RecentWeddingsFeed: React.FC<RecentWeddingsFeedProps> = ({
  weddings,
  onViewPhotographerProfile,
  openMultiQuote,
}) => {
  const [selectedWedding, setSelectedWedding] = useState<RecentWedding | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C88E9B]/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF5F0] rounded-full text-xs font-semibold text-[#5A4035] border border-[#C88E9B]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C7A86A]" />
            <span>Inspiração SEO de Casamentos Reais</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A4035]">
            Últimos Casamentos Publicados
          </h1>
          <p className="text-xs text-[#5A4035]/80">
            Inspire-se em histórias reais de casais e veja a essência de cada fotógrafo do portal
          </p>
        </div>

        <button
          onClick={openMultiQuote}
          className="px-5 py-2.5 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Camera className="w-4 h-4 text-[#C7A86A]" />
          <span>Quero Fotografias no Meu Casamento</span>
        </button>
      </div>

      {/* Pinterest Style Masonry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {weddings.map((w) => (
          <div
            key={w.id}
            onClick={() => setSelectedWedding(w)}
            className="bg-white rounded-3xl overflow-hidden border border-[#C88E9B]/20 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div className="relative h-64 overflow-hidden bg-slate-900">
              <img
                src={w.coverImage}
                alt={w.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              <div className="absolute top-3 left-3 bg-[#C88E9B] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                {w.style}
              </div>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[11px] font-medium text-white/80 uppercase block">{w.venue}</span>
                <h3 className="font-serif font-bold text-lg leading-tight line-clamp-1">{w.couple}</h3>
                <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#C88E9B]" />
                  <span>{w.city}, {w.state}</span>
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <p className="text-xs text-[#5A4035]/80 line-clamp-2 leading-relaxed">
                "{w.story}"
              </p>

              <div className="pt-3 border-t border-[#5A4035]/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5A4035]/50 block">Fotógrafo</span>
                  <span className="font-bold text-[#5A4035]">{w.photographerName}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewPhotographerProfile(w.photographerSlug);
                  }}
                  className="px-3 py-1.5 bg-[#FAF5F0] hover:bg-[#F6EEE8] text-[#C88E9B] font-bold rounded-lg border border-[#C88E9B]/20 text-[11px]"
                >
                  Ver Estúdio →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Wedding Story Modal */}
      {selectedWedding && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full my-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-[#C88E9B]/30">
            <button
              onClick={() => setSelectedWedding(null)}
              className="absolute top-4 right-4 text-[#5A4035]/60 hover:text-[#5A4035] p-2 rounded-full hover:bg-[#FAF5F0]"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#C88E9B] uppercase tracking-wider">{selectedWedding.venue} • {selectedWedding.city}</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A4035]">{selectedWedding.title}</h2>
              <p className="text-xs text-[#5A4035]/70">Casamento realizado em {selectedWedding.date}</p>
            </div>

            <p className="text-sm text-[#5A4035]/90 leading-relaxed font-serif italic border-l-4 border-[#C88E9B] pl-4">
              "{selectedWedding.story}"
            </p>

            {/* Gallery grid of the wedding */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-[#5A4035]">Galeria do Casamento</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedWedding.gallery.map((img, i) => (
                  <img key={i} src={img} alt="Foto do Casamento" className="w-full h-48 object-cover rounded-2xl shadow-sm" />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#5A4035]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#5A4035]/70 block">Fotografia por</span>
                <span className="font-serif font-bold text-base text-[#5A4035]">{selectedWedding.photographerName}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const slug = selectedWedding.photographerSlug;
                    setSelectedWedding(null);
                    onViewPhotographerProfile(slug);
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#5A4035] text-white font-bold text-xs rounded-xl hover:bg-[#C88E9B] transition-colors"
                >
                  Ver Perfil do Fotógrafo
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
