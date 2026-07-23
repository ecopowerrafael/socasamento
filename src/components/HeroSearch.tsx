import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Filter, CheckCircle2, ChevronRight, Camera, Film, Compass, Heart, Users, Sun } from 'lucide-react';
import { CategoryType } from '../types';

interface HeroSearchProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: CategoryType | 'Todos') => void;
  onSearchSubmit: (cityQuery: string) => void;
  photographerCount: number;
}

export const CATEGORIES: { name: CategoryType; icon: React.FC<{ className?: string }> }[] = [
  { name: 'Fotógrafos', icon: Camera },
  { name: 'Foto e Filme', icon: Film },
  { name: 'Drone', icon: Compass },
  { name: 'Pré Wedding', icon: Heart },
  { name: 'Pós Wedding', icon: Sun },
  { name: 'Mini Wedding', icon: Users },
  { name: 'Destination Wedding', icon: MapPin },
  { name: 'Casamento Civil', icon: CheckCircle2 },
  { name: 'Casamento Religioso', icon: CheckCircle2 },
];

export const TOP_CITIES_SUGGESTIONS = [
  'Piracicaba',
  'São Paulo',
  'Campinas',
  'Curitiba',
  'Sorocaba',
  'Osasco',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Florianópolis'
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  selectedCity,
  setSelectedCity,
  selectedCategory,
  setSelectedCategory,
  onSearchSubmit,
  photographerCount,
}) => {
  const [cityInput, setCityInput] = useState(selectedCity || '');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(cityInput);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F6EEE8] via-[#FAF5F0] to-[#F6EEE8] pt-8 pb-14 border-b border-[#C88E9B]/15">
      {/* Subtle Background Rings Accent */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#C88E9B]/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#C7A86A]/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#C88E9B]/30 shadow-xs text-xs font-semibold text-[#5A4035]">
            <Sparkles className="w-3.5 h-3.5 text-[#C7A86A]" />
            <span>Mais de {photographerCount}+ Estúdios Verificados no Brasil</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#5A4035] leading-tight tracking-tight">
            Encontre o fotógrafo perfeito para registrar o dia mais importante da sua vida
          </h1>

          <p className="text-base sm:text-lg text-[#5A4035]/80 font-normal max-w-2xl mx-auto">
            Busca especializada por cidade, estilo, orçamento e entrega de álbum. Receba orçamentos de profissionais avaliados por noivos reais.
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-3 sm:p-4 shadow-xl border border-[#C88E9B]/25">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch gap-3">
            
            {/* City Field */}
            <div className="relative flex-1">
              <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1 px-3">
                Onde será seu casamento?
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-5 h-5 text-[#C88E9B] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => {
                    setCityInput(e.target.value);
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  placeholder="Digite a cidade (ex: Piracicaba, São Paulo...)"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-[#5A4035] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#C88E9B] focus:bg-white transition-all placeholder:text-[#5A4035]/40"
                />
              </div>

              {/* City Suggestions Autocomplete Dropdown */}
              {showCityDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-[#C88E9B]/20 z-30 p-2">
                  <div className="text-[11px] font-bold text-[#5A4035]/60 uppercase px-3 py-1">
                    Cidades em Destaque
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {TOP_CITIES_SUGGESTIONS.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setCityInput(city);
                          setSelectedCity(city);
                          setShowCityDropdown(false);
                          onSearchSubmit(city);
                        }}
                        className="text-left px-3 py-2 text-xs font-medium text-[#5A4035] hover:bg-[#F6EEE8] hover:text-[#C88E9B] rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <MapPin className="w-3 h-3 text-[#C88E9B]" />
                        <span>{city}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#5A4035]/10 flex justify-between items-center px-2">
                    <span className="text-[11px] text-[#5A4035]/60">Busca em todos os estados do Brasil</span>
                    <button
                      type="button"
                      onClick={() => setShowCityDropdown(false)}
                      className="text-[11px] text-[#C88E9B] font-semibold hover:underline"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full md:w-auto min-w-[140px] h-[48px] bg-gradient-to-r from-[#C88E9B] to-[#b07885] hover:from-[#b07885] hover:to-[#5A4035] text-white font-bold px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                <Search className="w-5 h-5 text-[#F6EEE8]" />
                <span className="text-sm">Buscar</span>
              </button>
            </div>
          </form>

          {/* Popular Search tags */}
          <div className="mt-3 pt-3 border-t border-[#5A4035]/10 flex flex-wrap items-center gap-2 px-1 text-xs text-[#5A4035]/70">
            <span className="font-semibold text-[#5A4035]">Mais pesquisados:</span>
            {['Piracicaba', 'São Paulo', 'Curitiba', 'Campinas', 'Sorocaba'].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCityInput(c);
                  setSelectedCity(c);
                  onSearchSubmit(c);
                }}
                className="px-2.5 py-1 bg-[#FAF5F0] hover:bg-[#C88E9B] hover:text-white rounded-lg transition-colors font-medium text-[#5A4035]"
              >
                Fotógrafo {c}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#5A4035] uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#C88E9B]" />
              <span>Explore por Categoria de Serviço</span>
            </h2>
            {selectedCategory !== 'Todos' && (
              <button
                onClick={() => setSelectedCategory('Todos')}
                className="text-xs text-[#C88E9B] font-semibold hover:underline"
              >
                Limpar filtro ({selectedCategory})
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(isSelected ? 'Todos' : cat.name)}
                  className={`p-3 rounded-xl flex flex-col items-center text-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-[#5A4035] text-[#F6EEE8] shadow-md border-2 border-[#C7A86A]'
                      : 'bg-white hover:bg-[#FAF5F0] text-[#5A4035] border border-[#C88E9B]/20 hover:border-[#C88E9B]'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#C88E9B] text-white' : 'bg-[#F6EEE8] text-[#5A4035]'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
