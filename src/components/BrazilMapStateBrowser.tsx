import React, { useState } from 'react';
import { BRAZIL_STATES } from '../data/mockData';
import { StateData } from '../types';
import { MapPin, Building2, ChevronRight, Search } from 'lucide-react';

interface BrazilMapStateBrowserProps {
  onSelectCity: (city: string) => void;
}

export const BrazilMapStateBrowser: React.FC<BrazilMapStateBrowserProps> = ({ onSelectCity }) => {
  const [selectedState, setSelectedState] = useState<StateData | null>(BRAZIL_STATES[0]); // SP default

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C88E9B]/20 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#5A4035] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C88E9B]" />
            <span>Navegação Por Estados e Cidades do Brasil</span>
          </h2>
          <p className="text-xs text-[#5A4035]/70">
            Selecione o estado para listar as principais cidades com fotógrafos de casamento
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* State Selection Column */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-2">
            1. Selecione o Estado (UF):
          </label>
          {BRAZIL_STATES.map((st) => {
            const isSelected = selectedState?.uf === st.uf;
            return (
              <button
                key={st.uf}
                onClick={() => setSelectedState(st)}
                className={`w-full p-3 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#5A4035] text-white shadow-xs'
                    : 'bg-[#FAF5F0] hover:bg-[#F6EEE8] text-[#5A4035]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] ${isSelected ? 'bg-[#C7A86A] text-[#5A4035]' : 'bg-white text-[#5A4035]'}`}>
                    {st.uf}
                  </span>
                  <span>{st.name}</span>
                </div>
                <span className="text-[10px] opacity-80">{st.photographersCount} Fotógrafos</span>
              </button>
            );
          })}
        </div>

        {/* Cities Selection Column */}
        <div className="md:col-span-2 bg-[#FAF5F0] p-6 rounded-2xl border border-[#C88E9B]/20 space-y-4">
          {selectedState ? (
            <>
              <div className="border-b border-[#5A4035]/10 pb-3">
                <h3 className="font-serif font-bold text-base text-[#5A4035]">
                  Cidades com Fotógrafos Cadastrados em {selectedState.name} ({selectedState.uf})
                </h3>
                <p className="text-xs text-[#5A4035]/70 mt-0.5">
                  Clique em uma cidade para ver os estúdios locais
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedState.topCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => onSelectCity(city)}
                    className="p-3 bg-white hover:bg-[#C88E9B] hover:text-white rounded-xl text-xs font-bold text-[#5A4035] border border-[#5A4035]/10 transition-colors flex items-center justify-between group shadow-xs"
                  >
                    <span className="truncate">{city}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#C88E9B] group-hover:text-white" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-[#5A4035]/70">Selecione um estado ao lado.</p>
          )}
        </div>

      </div>

    </div>
  );
};
