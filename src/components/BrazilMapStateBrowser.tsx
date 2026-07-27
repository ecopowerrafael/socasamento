import React, { useState, useEffect } from 'react';
import { MapPin, ChevronRight, Loader2 } from 'lucide-react';

interface NavCity {
  id: number;
  name: string;
  slug: string;
  featured?: boolean;
  url?: string;
}

interface NavState {
  id: number;
  name: string;
  uf: string;
  slug: string;
  photographersCount?: number;
  cities: NavCity[];
}

interface BrazilMapStateBrowserProps {
  onSelectCity: (city: string) => void;
}

export const BrazilMapStateBrowser: React.FC<BrazilMapStateBrowserProps> = ({ onSelectCity }) => {
  const [navStates, setNavStates] = useState<NavState[]>([]);
  const [selectedState, setSelectedState] = useState<NavState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadNavigation() {
      try {
        const res = await fetch('/api/navigation/locations');
        const data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.error || 'Não foi possível consultar as localidades.');
        const states = Array.isArray(data.states) ? data.states : [];
        if (isMounted) {
          setNavStates(states);
          setSelectedState(states[0] || null);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'MySQL indisponível.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadNavigation();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C88E9B]/20 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#5A4035] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C88E9B]" />
            <span>Navegação por Estados e Cidades do Brasil</span>
          </h2>
          <p className="text-xs text-[#5A4035]/70">
            Selecione o estado para listar as principais cidades com fotógrafos de casamento
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center gap-2 text-[#5A4035]">
          <Loader2 className="w-5 h-5 animate-spin text-[#C88E9B]" />
          <span className="text-xs font-semibold">Carregando mapa de localidades do banco de dados...</span>
        </div>
      ) : error ? (
        <div className="py-10 text-center text-sm text-red-700 bg-red-50 rounded-2xl">
          {error} Os dados não foram substituídos por exemplos locais.
        </div>
      ) : navStates.length === 0 ? (
        <div className="py-10 text-center text-sm text-[#5A4035]/70 bg-[#FAF5F0] rounded-2xl">
          Ainda não há fotógrafos aprovados para exibir na navegação regional.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* State Selection Column */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-2">
              1. Selecione o Estado (UF):
            </label>
            {navStates.map((st) => {
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
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] ${
                        isSelected ? 'bg-[#C7A86A] text-[#5A4035]' : 'bg-white text-[#5A4035]'
                      }`}
                    >
                      {st.uf}
                    </span>
                    <span>{st.name}</span>
                  </div>
                  <span className="text-[10px] opacity-80">{st.photographersCount || 0} Fotógrafos</span>
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

                {selectedState.cities && selectedState.cities.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedState.cities.map((city) => (
                      <button
                        key={city.id || city.name}
                        onClick={() => onSelectCity(city.name)}
                        className="p-3 bg-white hover:bg-[#C88E9B] hover:text-white rounded-xl text-xs font-bold text-[#5A4035] border border-[#5A4035]/10 transition-colors flex items-center justify-between group shadow-xs"
                      >
                        <span className="truncate">{city.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#C88E9B] group-hover:text-white" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#5A4035]/60 italic py-4">
                    Nenhuma cidade ativa exibida na navegação para este estado no momento.
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-[#5A4035]/70">Selecione um estado ao lado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
