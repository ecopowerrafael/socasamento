import React from 'react';
import { Photographer } from '../types';
import { Star, ShieldCheck, MapPin, X, Check, Sparkles, MessageSquare, Scale, ArrowLeft } from 'lucide-react';

interface ComparePhotographersViewProps {
  photographers: Photographer[];
  comparedIds: string[];
  onRemoveCompare: (id: string) => void;
  onClearAllCompare: () => void;
  onViewProfile: (slug: string) => void;
  onOpenQuote: (photographer: Photographer) => void;
  openMultiQuote: () => void;
  onBackToDirectory: () => void;
}

export const ComparePhotographersView: React.FC<ComparePhotographersViewProps> = ({
  photographers,
  comparedIds,
  onRemoveCompare,
  onClearAllCompare,
  onViewProfile,
  onOpenQuote,
  openMultiQuote,
  onBackToDirectory,
}) => {
  const selectedPhotographers = photographers.filter((p) => comparedIds.includes(p.id));

  if (selectedPhotographers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-[#C88E9B]/15 text-[#C88E9B] rounded-full flex items-center justify-center mx-auto">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#5A4035]">
          Nenhum fotógrafo selecionado para comparação
        </h2>
        <p className="text-sm text-[#5A4035]/80 max-w-md mx-auto">
          Navegue pelo diretório e clique no botão "+ Comparar" nos cards para colocar até 4 fotógrafos lado a lado.
        </p>
        <button
          onClick={onBackToDirectory}
          className="px-6 py-3 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ir para a Busca de Fotógrafos</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C88E9B]/20 pb-6">
        <div>
          <button
            onClick={onBackToDirectory}
            className="text-xs font-semibold text-[#C88E9B] hover:underline flex items-center gap-1 mb-1"
          >
            ← Voltar para a busca
          </button>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A4035]">
            Comparativo de Fotógrafos Lado a Lado ({selectedPhotographers.length}/4)
          </h1>
          <p className="text-xs text-[#5A4035]/80">
            Análise detalhada de preços, estilos, experiência e entregáveis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClearAllCompare}
            className="text-xs text-[#5A4035]/70 hover:text-[#5A4035] font-semibold underline"
          >
            Limpar tudo
          </button>
          <button
            onClick={openMultiQuote}
            className="px-5 py-2.5 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#C7A86A]" />
            <span>Cotar Todos os {selectedPhotographers.length} Simultaneamente</span>
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto bg-white rounded-3xl border border-[#C88E9B]/20 shadow-md">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#C88E9B]/20 bg-[#FAF5F0]">
              <th className="p-4 w-48 font-serif font-bold text-[#5A4035] text-sm">Atributos</th>
              {selectedPhotographers.map((p) => (
                <th key={p.id} className="p-4 min-w-[220px] align-top relative border-l border-[#C88E9B]/20">
                  <button
                    onClick={() => onRemoveCompare(p.id)}
                    className="absolute top-2 right-2 text-[#5A4035]/40 hover:text-[#5A4035] p-1"
                    title="Remover da comparação"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="space-y-2 text-center pt-2">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-16 h-16 rounded-2xl mx-auto object-cover shadow-sm border border-white"
                    />
                    <h3 className="font-serif font-bold text-sm text-[#5A4035] leading-tight">{p.studioName}</h3>
                    <p className="text-[11px] text-[#5A4035]/70 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C88E9B]" />
                      <span>{p.city}, {p.state}</span>
                    </p>
                    <button
                      onClick={() => onViewProfile(p.slug)}
                      className="text-[11px] text-[#C88E9B] font-bold hover:underline"
                    >
                      Ver Perfil Completo →
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#5A4035]/10 text-[#5A4035]">
            
            {/* Price Starting From */}
            <tr className="hover:bg-[#FAF5F0]/50">
              <td className="p-4 font-bold text-[#5A4035]">Investimento Mínimo</td>
              {selectedPhotographers.map((p) => (
                <td key={p.id} className="p-4 text-center font-serif font-bold text-sm text-[#5A4035] border-l border-[#C88E9B]/20">
                  R$ {p.priceStartingFrom.toLocaleString('pt-BR')}
                  <span className="block text-[10px] font-sans font-normal text-[#5A4035]/60">({p.priceCategory})</span>
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr className="hover:bg-[#FAF5F0]/50">
              <td className="p-4 font-bold text-[#5A4035]">Nota e Avaliações</td>
              {selectedPhotographers.map((p) => (
                <td key={p.id} className="p-4 text-center border-l border-[#C88E9B]/20">
                  <div className="inline-flex items-center gap-1 bg-[#FAF5F0] px-2.5 py-1 rounded-lg border border-[#C88E9B]/20 font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#C7A86A] text-[#C7A86A]" />
                    <span>{p.rating.toFixed(1)}</span>
                    <span className="text-[#5A4035]/60 text-[10px]">({p.reviewCount})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Verification Badge */}
            <tr className="hover:bg-[#FAF5F0]/50">
              <td className="p-4 font-bold text-[#5A4035]">Selo Verificado</td>
              {selectedPhotographers.map((p) => (
                <td key={p.id} className="p-4 text-center border-l border-[#C88E9B]/20">
                  {p.badges.includes('Verificado') ? (
                    <span className="bg-[#5A4035] text-[#C7A86A] text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#C7A86A]" />
                      <span>Auditado</span>
                    </span>
                  ) : (
                    <span className="text-[#5A4035]/50">-</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Experience & Weddings Completed */}
            <tr className="hover:bg-[#FAF5F0]/50">
              <td className="p-4 font-bold text-[#5A4035]">Experiência</td>
              {selectedPhotographers.map((p) => (
                <td key={p.id} className="p-4 text-center border-l border-[#C88E9B]/20 font-medium">
                  <strong>{p.yearsExperience} Anos</strong> de carreira
                  <span className="block text-[11px] text-[#5A4035]/70">({p.weddingsCompleted}+ casamentos)</span>
                </td>
              ))}
            </tr>

            {/* Styles */}
            <tr className="hover:bg-[#FAF5F0]/50">
              <td className="p-4 font-bold text-[#5A4035]">Estilos Predominantes</td>
              {selectedPhotographers.map((p) => (
                <td key={p.id} className="p-4 border-l border-[#C88E9B]/20">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {p.styles.map((s) => (
                      <span key={s} className="bg-[#F6EEE8] text-[#5A4035] px-2 py-0.5 rounded font-semibold text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Deliverables */}
            <tr className="hover:bg-[#FAF5F0]/50">
              <td className="p-4 font-bold text-[#5A4035]">Entregáveis Disponíveis</td>
              {selectedPhotographers.map((p) => (
                <td key={p.id} className="p-4 border-l border-[#C88E9B]/20">
                  <ul className="space-y-1 text-[11px]">
                    {['Foto', 'Vídeo', 'Drone', 'Álbum', 'Same Day Edit', 'Making Of'].map((item) => {
                      const has = p.deliverables.includes(item as any);
                      return (
                        <li key={item} className={`flex items-center gap-1.5 ${has ? 'text-[#5A4035] font-semibold' : 'text-[#5A4035]/30'}`}>
                          <Check className={`w-3 h-3 ${has ? 'text-[#C88E9B]' : 'text-transparent'}`} />
                          <span>{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Actions */}
            <tr className="bg-[#FAF5F0]">
              <td className="p-4 font-bold text-[#5A4035]">Ação de Orçamento</td>
              {selectedPhotographers.map((p) => (
                <td key={p.id} className="p-4 border-l border-[#C88E9B]/20 text-center">
                  <button
                    onClick={() => onOpenQuote(p)}
                    className="w-full py-2 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold rounded-xl shadow-xs transition-colors text-xs flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Pedir Orçamento</span>
                  </button>
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
};
