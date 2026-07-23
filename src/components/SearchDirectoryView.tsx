import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, MapPin, X, Star, Check, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { Photographer, StyleType, DeliveryType, SearchFilters } from '../types';
import { PhotographerCard } from './PhotographerCard';

interface SearchDirectoryViewProps {
  photographers: Photographer[];
  initialCity?: string;
  onViewProfile: (slug: string) => void;
  onOpenQuote: (photographer: Photographer) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
  openMultiQuote: () => void;
}

const STYLES_LIST: StyleType[] = [
  'Documental',
  'Fine Art',
  'Clássico',
  'Editorial',
  'Boho',
  'Luxury',
  'Minimalista',
  'Fotojornalismo',
  'Lifestyle'
];

const DELIVERABLES_LIST: DeliveryType[] = [
  'Foto',
  'Vídeo',
  'Drone',
  'Same Day Edit',
  'Álbum',
  'Making Of'
];

const PRICE_RANGES = [
  { label: 'Todos os preços', value: 'ALL' },
  { label: 'Até R$ 2.000', value: 'Até R$ 2.000' },
  { label: 'R$ 2.000 a R$ 5.000', value: 'R$ 2.000 a R$ 5.000' },
  { label: 'R$ 5.000 a R$ 10.000', value: 'R$ 5.000 a R$ 10.000' },
  { label: 'Acima de R$ 10.000', value: 'Acima de R$ 10.000' }
];

export const SearchDirectoryView: React.FC<SearchDirectoryViewProps> = ({
  photographers,
  initialCity = '',
  onViewProfile,
  onOpenQuote,
  favorites,
  onToggleFavorite,
  comparedIds,
  onToggleCompare,
  openMultiQuote,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialCity);
  const [selectedStyles, setSelectedStyles] = useState<StyleType[]>([]);
  const [selectedDeliverables, setSelectedDeliverables] = useState<DeliveryType[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'price_asc' | 'price_desc' | 'experience'>('rating');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Filter Logic
  const filteredPhotographers = useMemo(() => {
    return photographers.filter((p) => {
      // Search term (City, State, Neighborhood, Studio Name, Name)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesLocation =
          p.city.toLowerCase().includes(term) ||
          p.state.toLowerCase().includes(term) ||
          (p.neighborhood && p.neighborhood.toLowerCase().includes(term)) ||
          p.studioName.toLowerCase().includes(term) ||
          p.name.toLowerCase().includes(term);
        if (!matchesLocation) return false;
      }

      // Price range
      if (selectedPriceRange !== 'ALL' && p.priceCategory !== selectedPriceRange) {
        return false;
      }

      // Verified only
      if (verifiedOnly && !p.badges.includes('Verificado')) {
        return false;
      }

      // Styles match (ANY)
      if (selectedStyles.length > 0) {
        const hasStyle = selectedStyles.some((s) => p.styles.includes(s));
        if (!hasStyle) return false;
      }

      // Deliverables match (ANY)
      if (selectedDeliverables.length > 0) {
        const hasDeliv = selectedDeliverables.some((d) => p.deliverables.includes(d));
        if (!hasDeliv) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      if (sortBy === 'price_asc') return a.priceStartingFrom - b.priceStartingFrom;
      if (sortBy === 'price_desc') return b.priceStartingFrom - a.priceStartingFrom;
      if (sortBy === 'experience') return b.yearsExperience - a.yearsExperience;
      return 0;
    });
  }, [photographers, searchTerm, selectedStyles, selectedDeliverables, selectedPriceRange, verifiedOnly, sortBy]);

  const toggleStyle = (style: StyleType) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const toggleDeliverable = (deliv: DeliveryType) => {
    setSelectedDeliverables((prev) =>
      prev.includes(deliv) ? prev.filter((d) => d !== deliv) : [...prev, deliv]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedStyles([]);
    setSelectedDeliverables([]);
    setSelectedPriceRange('ALL');
    setVerifiedOnly(false);
    setSortBy('rating');
  };

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    selectedStyles.length +
    selectedDeliverables.length +
    (selectedPriceRange !== 'ALL' ? 1 : 0) +
    (verifiedOnly ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Directory Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C88E9B]/20 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A4035]">
            Busca Inteligente de Fotógrafos de Casamento
          </h1>
          <p className="text-xs sm:text-sm text-[#5A4035]/80 mt-1">
            Exibindo <span className="font-bold text-[#C88E9B]">{filteredPhotographers.length}</span> fotógrafos qualificados em todo o Brasil
          </p>
        </div>

        {comparedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-[#C7A86A]/20 border border-[#C7A86A] px-4 py-2 rounded-xl text-xs font-semibold text-[#5A4035]">
            <span>{comparedIds.length} fotógrafos selecionados para comparação</span>
            <button
              onClick={openMultiQuote}
              className="ml-2 bg-[#5A4035] text-white px-3 py-1 rounded-lg hover:bg-[#C88E9B] transition-colors"
            >
              Solicitar Orçamento de Todos
            </button>
          </div>
        )}
      </div>

      {/* Main Search & Filter Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#C88E9B]/20 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#C88E9B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Cidade (ex: Piracicaba), Estado, Bairro ou Nome do Estúdio..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-sm text-[#5A4035] focus:outline-none focus:ring-2 focus:ring-[#C88E9B] font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A4035]/50 hover:text-[#5A4035]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Price Range Dropdown */}
          <select
            value={selectedPriceRange}
            onChange={(e) => setSelectedPriceRange(e.target.value)}
            className="px-3 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-xs font-semibold text-[#5A4035] focus:outline-none focus:ring-2 focus:ring-[#C88E9B]"
          >
            {PRICE_RANGES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-xs font-semibold text-[#5A4035] focus:outline-none focus:ring-2 focus:ring-[#C88E9B]"
          >
            <option value="rating">Ordenar: Melhor Avaliados</option>
            <option value="reviews">Ordenar: Mais Avaliações</option>
            <option value="price_asc">Ordenar: Menor Preço</option>
            <option value="price_desc">Ordenar: Maior Preço</option>
            <option value="experience">Ordenar: Anos de Experiência</option>
          </select>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition-all ${
              activeFiltersCount > 0
                ? 'bg-[#5A4035] text-white border-[#5A4035]'
                : 'bg-[#FAF5F0] hover:bg-[#F6EEE8] text-[#5A4035] border-[#C88E9B]/30'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#C7A86A]" />
            <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>
        </div>

        {/* Collapsible Expanded Filters Panel */}
        {isFilterPanelOpen && (
          <div className="pt-4 border-t border-[#5A4035]/10 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Style Filters */}
            <div>
              <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-2">
                Estilo Fotográfico
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STYLES_LIST.map((style) => {
                  const isSel = selectedStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isSel
                          ? 'bg-[#C88E9B] text-white font-semibold'
                          : 'bg-[#FAF5F0] text-[#5A4035] hover:bg-[#F6EEE8] border border-[#5A4035]/10'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deliverables Filters */}
            <div>
              <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-2">
                Entregáveis e Serviços
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DELIVERABLES_LIST.map((deliv) => {
                  const isSel = selectedDeliverables.includes(deliv);
                  return (
                    <button
                      key={deliv}
                      type="button"
                      onClick={() => toggleDeliverable(deliv)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isSel
                          ? 'bg-[#5A4035] text-white font-semibold'
                          : 'bg-[#FAF5F0] text-[#5A4035] hover:bg-[#F6EEE8] border border-[#5A4035]/10'
                      }`}
                    >
                      {deliv}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider">
                Selo de Garantia
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#5A4035] font-semibold">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-[#C88E9B] focus:ring-[#C88E9B] w-4 h-4"
                />
                <span>Exibir apenas fotógrafos com Selo Verificado</span>
              </label>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-2 text-xs text-[#C88E9B] font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Limpar todos os filtros</span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#5A4035]/10 text-xs">
            <span className="font-semibold text-[#5A4035]/70">Filtros ativos:</span>
            {searchTerm && (
              <span className="bg-[#F6EEE8] text-[#5A4035] px-2.5 py-0.5 rounded-full border border-[#C88E9B]/30 flex items-center gap-1 font-semibold">
                Cidade: {searchTerm}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
              </span>
            )}
            {selectedPriceRange !== 'ALL' && (
              <span className="bg-[#F6EEE8] text-[#5A4035] px-2.5 py-0.5 rounded-full border border-[#C88E9B]/30 flex items-center gap-1 font-semibold">
                Preço: {selectedPriceRange}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedPriceRange('ALL')} />
              </span>
            )}
            {selectedStyles.map((s) => (
              <span key={s} className="bg-[#C88E9B]/15 text-[#5A4035] px-2.5 py-0.5 rounded-full border border-[#C88E9B]/30 flex items-center gap-1 font-semibold">
                {s}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleStyle(s)} />
              </span>
            ))}
            {selectedDeliverables.map((d) => (
              <span key={d} className="bg-[#5A4035]/10 text-[#5A4035] px-2.5 py-0.5 rounded-full border border-[#5A4035]/20 flex items-center gap-1 font-semibold">
                {d}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleDeliverable(d)} />
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-[#C88E9B] font-bold hover:underline ml-2 text-xs"
            >
              Limpar tudo
            </button>
          </div>
        )}
      </div>

      {/* Grid Results */}
      {filteredPhotographers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotographers.map((p) => (
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
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#C88E9B]/20 space-y-4 max-w-xl mx-auto">
          <Search className="w-12 h-12 text-[#C88E9B] mx-auto" />
          <h3 className="text-xl font-serif font-bold text-[#5A4035]">
            Nenhum fotógrafo encontrado com estes filtros
          </h3>
          <p className="text-xs text-[#5A4035]/80">
            Tente remover alguns filtros de estilo ou preço, ou pesquise por outra cidade da região.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-2.5 bg-[#C88E9B] text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-[#b07885] transition-colors"
          >
            Limpar Filtros e Ver Todos
          </button>
        </div>
      )}

    </div>
  );
};
