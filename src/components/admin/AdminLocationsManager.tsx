import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  Loader2,
  AlertCircle,
  Navigation,
  Star,
  Globe2,
  SlidersHorizontal,
} from 'lucide-react';
import { StateItem, CityItem } from '../../types';

export const AdminLocationsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'states' | 'cities'>('states');

  // STATES STATE
  const [statesList, setStatesList] = useState<StateItem[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [stateSearch, setStateSearch] = useState('');
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [editingState, setEditingState] = useState<StateItem | null>(null);
  const [savingState, setSavingState] = useState(false);

  // STATE FORM
  const [stateFormData, setStateFormData] = useState({
    name: '',
    uf: '',
    slug: '',
    ibgeCode: '',
    region: 'Sudeste',
    image: '',
    introductoryText: '',
    seoTitle: '',
    seoDescription: '',
    showInNavigation: true,
    sortOrder: 0,
    status: 'active' as 'active' | 'inactive',
  });

  // CITIES STATE
  const [citiesList, setCitiesList] = useState<CityItem[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [citySearch, setCitySearch] = useState('');
  const [selectedStateUf, setSelectedStateUf] = useState<string>('all');
  const [cityRegionFilter, setCityRegionFilter] = useState<string>('all');
  const [cityStatusFilter, setCityStatusFilter] = useState<string>('all');
  const [cityNavFilter, setCityNavFilter] = useState<string>('all');
  const [cityFeaturedFilter, setCityFeaturedFilter] = useState<string>('all');
  const [cityPage, setCityPage] = useState(1);
  const [cityTotalPages, setCityTotalPages] = useState(1);
  const [cityTotalCount, setCityTotalCount] = useState(0);

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<CityItem | null>(null);
  const [savingCity, setSavingCity] = useState(false);

  // CITY FORM
  const [cityFormData, setCityFormData] = useState({
    stateUf: 'SP',
    stateId: 0,
    name: '',
    slug: '',
    ibgeCode: '',
    latitude: '',
    longitude: '',
    image: '',
    introductoryText: '',
    heroText: '',
    seoTitle: '',
    seoDescription: '',
    focusKeyword: '',
    showInNavigation: true,
    featured: false,
    sortOrder: 0,
    status: 'active' as 'active' | 'inactive',
  });

  // IBGE IMPORT STATE
  const [importingIbge, setImportingIbge] = useState(false);
  const [importReport, setImportReport] = useState<any | null>(null);
  const [locationAlert, setLocationAlert] = useState<string | null>(null);

  // FETCH STATES
  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const res = await fetch('/api/admin/states');
      const data = await res.json();
      if (data.success) {
        setStatesList(data.states || []);
      }
    } catch (err) {
      console.error('Error fetching states:', err);
    } finally {
      setLoadingStates(false);
    }
  };

  // FETCH CITIES
  const fetchCities = async () => {
    setLoadingCities(true);
    try {
      const query = new URLSearchParams({
        search: citySearch,
        stateUf: selectedStateUf === 'all' ? '' : selectedStateUf,
        region: cityRegionFilter,
        status: cityStatusFilter,
        showInNavigation: cityNavFilter,
        featured: cityFeaturedFilter,
        page: String(cityPage),
        limit: '15',
      });
      const res = await fetch(`/api/admin/cities?${query}`);
      const data = await res.json();
      if (data.success) {
        setCitiesList(data.cities || []);
        setCityTotalPages(data.totalPages || 1);
        setCityTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (activeTab === 'cities') {
      fetchCities();
    }
  }, [
    activeTab,
    citySearch,
    selectedStateUf,
    cityRegionFilter,
    cityStatusFilter,
    cityNavFilter,
    cityFeaturedFilter,
    cityPage,
  ]);

  // IBGE IMPORT HANDLER
  const handleImportIbge = async () => {
    if (
      !confirm(
        'Deseja importar/sincronizar todos os 26 Estados + DF e municípios do Brasil via IBGE? Registros existentes com edições manuais serão preservados.'
      )
    )
      return;

    setImportingIbge(true);
    setImportReport(null);
    try {
      const res = await fetch('/api/admin/import-ibge-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setNavigationActive: true }),
      });
      const data = await res.json();
      if (data.success) {
        setImportReport(data.report);
        fetchStates();
        if (activeTab === 'cities') fetchCities();
      } else {
        alert(data.error || 'Erro na importação IBGE');
      }
    } catch (err) {
      alert('Erro de conexão durante a importação.');
    } finally {
      setImportingIbge(false);
    }
  };

  // STATE HANDLERS
  const handleOpenAddState = () => {
    setEditingState(null);
    setStateFormData({
      name: '',
      uf: '',
      slug: '',
      ibgeCode: '',
      region: 'Sudeste',
      image: '',
      introductoryText: '',
      seoTitle: '',
      seoDescription: '',
      showInNavigation: true,
      sortOrder: (statesList.length + 1) * 10,
      status: 'active',
    });
    setIsStateModalOpen(true);
  };

  const handleOpenEditState = (st: StateItem) => {
    setEditingState(st);
    setStateFormData({
      name: st.name,
      uf: st.uf,
      slug: st.slug,
      ibgeCode: st.ibgeCode || '',
      region: st.region || 'Sudeste',
      image: st.image || '',
      introductoryText: st.introductoryText || '',
      seoTitle: st.seoTitle || '',
      seoDescription: st.seoDescription || '',
      showInNavigation: st.showInNavigation,
      sortOrder: st.sortOrder || 0,
      status: st.status,
    });
    setIsStateModalOpen(true);
  };

  const handleSaveState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateFormData.name.trim() || !stateFormData.uf.trim()) return;

    setSavingState(true);
    try {
      const url = editingState ? `/api/admin/states/${editingState.id}` : '/api/admin/states';
      const method = editingState ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stateFormData),
      });

      const data = await res.json();
      if (data.success) {
        setIsStateModalOpen(false);
        fetchStates();
      } else {
        alert(data.error || 'Erro ao salvar estado');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar estado.');
    } finally {
      setSavingState(false);
    }
  };

  const handleToggleStateStatus = async (st: StateItem) => {
    const newStatus = st.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/states/${st.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) fetchStates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteState = async (st: StateItem) => {
    if (!confirm(`Deseja realmente excluir o estado ${st.name} (${st.uf})?`)) return;

    try {
      const res = await fetch(`/api/admin/states/${st.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLocationAlert(data.error || 'Não foi possível excluir este estado.');
      } else {
        fetchStates();
      }
    } catch (err) {
      setLocationAlert('Erro de conexão ao excluir estado.');
    }
  };

  // CITY HANDLERS
  const handleOpenAddCity = () => {
    setEditingCity(null);
    const defaultUf = statesList.length > 0 ? statesList[0].uf : 'SP';
    const defaultStateId = statesList.length > 0 ? statesList[0].id : 0;

    setCityFormData({
      stateUf: defaultUf,
      stateId: defaultStateId,
      name: '',
      slug: '',
      ibgeCode: '',
      latitude: '',
      longitude: '',
      image: '',
      introductoryText: '',
      heroText: '',
      seoTitle: '',
      seoDescription: '',
      focusKeyword: '',
      showInNavigation: true,
      featured: false,
      sortOrder: (citiesList.length + 1) * 10,
      status: 'active',
    });
    setIsCityModalOpen(true);
  };

  const handleOpenEditCity = (c: CityItem) => {
    setEditingCity(c);
    setCityFormData({
      stateUf: c.stateUf,
      stateId: c.stateId || 0,
      name: c.name,
      slug: c.slug,
      ibgeCode: c.ibgeCode || '',
      latitude: c.latitude ? String(c.latitude) : '',
      longitude: c.longitude ? String(c.longitude) : '',
      image: c.image || '',
      introductoryText: c.introductoryText || '',
      heroText: c.heroText || '',
      seoTitle: c.seoTitle || '',
      seoDescription: c.seoDescription || '',
      focusKeyword: c.focusKeyword || '',
      showInNavigation: c.showInNavigation,
      featured: c.featured,
      sortOrder: c.sortOrder || 0,
      status: c.status,
    });
    setIsCityModalOpen(true);
  };

  const handleSaveCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityFormData.name.trim() || !cityFormData.stateUf) return;

    setSavingCity(true);
    try {
      const url = editingCity ? `/api/admin/cities/${editingCity.id}` : '/api/admin/cities';
      const method = editingCity ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cityFormData),
      });

      const data = await res.json();
      if (data.success) {
        setIsCityModalOpen(false);
        fetchCities();
      } else {
        alert(data.error || 'Erro ao salvar cidade');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar cidade.');
    } finally {
      setSavingCity(false);
    }
  };

  const handleToggleCityStatus = async (c: CityItem) => {
    const newStatus = c.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/cities/${c.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) fetchCities();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCity = async (c: CityItem) => {
    if (!confirm(`Deseja excluir a cidade ${c.name} (${c.stateUf})?`)) return;

    try {
      const res = await fetch(`/api/admin/cities/${c.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchCities();
      else alert(data.error || 'Erro ao excluir cidade');
    } catch (err) {
      alert('Erro ao excluir cidade');
    }
  };

  const filteredStates = statesList.filter(
    (st) =>
      st.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
      st.uf.toLowerCase().includes(stateSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Bar with IBGE Sync Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#5A4035] flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#C88E9B]" />
            <span>Gerenciamento de Localidades (Estados e Cidades)</span>
          </h2>
          <p className="text-xs text-[#5A4035]/70 mt-1">
            Gerencie os estados e municípios exibidos na seção “Navegação por Estados e Cidades do Brasil”
          </p>
        </div>

        <button
          onClick={handleImportIbge}
          disabled={importingIbge}
          className="px-4 py-2.5 bg-[#C7A86A] hover:bg-[#b09153] text-[#5A4035] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
        >
          {importingIbge ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#5A4035]" />
          ) : (
            <Download className="w-4 h-4 text-[#5A4035]" />
          )}
          <span>Importar estados e cidades do Brasil</span>
        </button>
      </div>

      {/* IBGE Import Report Alert */}
      {importReport && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start justify-between gap-3 animate-fade-in text-xs text-emerald-900">
          <div className="space-y-1">
            <p className="font-bold text-sm text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Importação IBGE concluída com sucesso!
            </p>
            <p>
              • {importReport.statesImported} novos estados criados ({importReport.statesUpdated} já cadastrados)
            </p>
            <p>
              • {importReport.citiesImported} novas cidades adicionadas ({importReport.citiesUpdated} atualizadas)
            </p>
          </div>
          <button
            onClick={() => setImportReport(null)}
            className="text-emerald-700 font-bold hover:underline"
          >
            Sair
          </button>
        </div>
      )}

      {/* Location Error Alert */}
      {locationAlert && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs text-red-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{locationAlert}</span>
          </div>
          <button onClick={() => setLocationAlert(null)} className="font-bold underline text-red-700">
            OK
          </button>
        </div>
      )}

      {/* Tab Switcher: Estados vs Cidades */}
      <div className="flex border-b border-[#C88E9B]/20 gap-2 bg-white px-4 pt-2 rounded-2xl">
        <button
          onClick={() => setActiveTab('states')}
          className={`pb-3 px-4 font-serif font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'states'
              ? 'border-[#C88E9B] text-[#5A4035]'
              : 'border-transparent text-[#5A4035]/60 hover:text-[#5A4035]'
          }`}
        >
          <MapPin className="w-4 h-4 text-[#C88E9B]" />
          <span>Estados do Brasil ({statesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cities')}
          className={`pb-3 px-4 font-serif font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'cities'
              ? 'border-[#C88E9B] text-[#5A4035]'
              : 'border-transparent text-[#5A4035]/60 hover:text-[#5A4035]'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#C88E9B]" />
          <span>Cidades Cadastradas ({cityTotalCount || citiesList.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: ESTADOS ================= */}
      {activeTab === 'states' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#C88E9B]/20 flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-[#5A4035]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por nome ou UF..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAF5F0] rounded-xl text-xs font-medium text-[#5A4035] focus:outline-none"
              />
            </div>

            <button
              onClick={handleOpenAddState}
              className="px-4 py-2 bg-[#5A4035] text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-[#4A332A]"
            >
              <Plus className="w-4 h-4 text-[#C7A86A]" />
              <span>Adicionar Estado</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#C88E9B]/20 shadow-xs overflow-hidden">
            {loadingStates ? (
              <div className="py-16 flex items-center justify-center gap-2 text-[#5A4035]">
                <Loader2 className="w-5 h-5 animate-spin text-[#C88E9B]" />
                <span className="text-xs font-semibold">Carregando estados...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF5F0] border-b border-[#C88E9B]/20 text-[11px] font-bold text-[#5A4035] uppercase">
                      <th className="py-3 px-4">UF</th>
                      <th className="py-3 px-4">Nome do Estado</th>
                      <th className="py-3 px-4">Região</th>
                      <th className="py-3 px-4 text-center">Cidades</th>
                      <th className="py-3 px-4 text-center">Fotógrafos</th>
                      <th className="py-3 px-4 text-center">Navegação</th>
                      <th className="py-3 px-4 text-center">Ordem</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C88E9B]/10 text-xs">
                    {filteredStates.map((st) => (
                      <tr key={st.id} className="hover:bg-[#FAF5F0]/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="w-7 h-7 rounded-md bg-[#5A4035] text-white flex items-center justify-center font-bold text-xs">
                            {st.uf}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#5A4035]">{st.name}</td>
                        <td className="py-3 px-4 text-[#5A4035]/70 font-semibold">{st.region || '—'}</td>
                        <td className="py-3 px-4 text-center font-bold">{st.citiesCount || 0}</td>
                        <td className="py-3 px-4 text-center font-bold text-[#C88E9B]">
                          {st.photographersCount || 0}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {st.showInNavigation ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Exibido
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">Oculto</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">{st.sortOrder}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleStateStatus(st)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              st.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {st.status === 'active' ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditState(st)}
                            className="p-1.5 text-[#5A4035] hover:bg-[#FAF5F0] rounded-lg"
                          >
                            <Edit2 className="w-4 h-4 text-[#C7A86A]" />
                          </button>
                          <button
                            onClick={() => handleDeleteState(st)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: CIDADES ================= */}
      {activeTab === 'cities' && (
        <div className="space-y-4">
          {/* Detailed Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#C88E9B]/20 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#5A4035]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar cidade..."
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setCityPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF5F0] rounded-xl text-xs font-medium text-[#5A4035] focus:outline-none"
                />
              </div>

              <button
                onClick={handleOpenAddCity}
                className="px-4 py-2 bg-[#5A4035] text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-[#4A332A] w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4 text-[#C7A86A]" />
                <span>Nova Cidade</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#C88E9B]/10 text-xs font-semibold text-[#5A4035]">
              <div>
                <label className="block text-[10px] text-[#5A4035]/70 mb-1">Estado (UF):</label>
                <select
                  value={selectedStateUf}
                  onChange={(e) => {
                    setSelectedStateUf(e.target.value);
                    setCityPage(1);
                  }}
                  className="w-full p-2 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/20"
                >
                  <option value="all">Todos os Estados</option>
                  {statesList.map((s) => (
                    <option key={s.uf} value={s.uf}>
                      {s.uf} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#5A4035]/70 mb-1">Região:</label>
                <select
                  value={cityRegionFilter}
                  onChange={(e) => {
                    setCityRegionFilter(e.target.value);
                    setCityPage(1);
                  }}
                  className="w-full p-2 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/20"
                >
                  <option value="all">Todas Regiões</option>
                  <option value="Sudeste">Sudeste</option>
                  <option value="Sul">Sul</option>
                  <option value="Nordeste">Nordeste</option>
                  <option value="Centro-Oeste">Centro-Oeste</option>
                  <option value="Norte">Norte</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#5A4035]/70 mb-1">Status:</label>
                <select
                  value={cityStatusFilter}
                  onChange={(e) => {
                    setCityStatusFilter(e.target.value);
                    setCityPage(1);
                  }}
                  className="w-full p-2 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/20"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#5A4035]/70 mb-1">Na Navegação:</label>
                <select
                  value={cityNavFilter}
                  onChange={(e) => {
                    setCityNavFilter(e.target.value);
                    setCityPage(1);
                  }}
                  className="w-full p-2 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/20"
                >
                  <option value="all">Todos</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#5A4035]/70 mb-1">Destaque:</label>
                <select
                  value={cityFeaturedFilter}
                  onChange={(e) => {
                    setCityFeaturedFilter(e.target.value);
                    setCityPage(1);
                  }}
                  className="w-full p-2 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/20"
                >
                  <option value="all">Todos</option>
                  <option value="true">Sim (Destaque)</option>
                  <option value="false">Não</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#C88E9B]/20 shadow-xs overflow-hidden">
            {loadingCities ? (
              <div className="py-16 flex items-center justify-center gap-2 text-[#5A4035]">
                <Loader2 className="w-5 h-5 animate-spin text-[#C88E9B]" />
                <span className="text-xs font-semibold">Carregando cidades do banco de dados...</span>
              </div>
            ) : citiesList.length === 0 ? (
              <div className="py-16 text-center text-[#5A4035]/60 text-xs">
                Nenhuma cidade encontrada com os filtros especificados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF5F0] border-b border-[#C88E9B]/20 text-[11px] font-bold text-[#5A4035] uppercase">
                      <th className="py-3 px-4">Cidade</th>
                      <th className="py-3 px-4">Estado / UF</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4 text-center">Fotógrafos</th>
                      <th className="py-3 px-4 text-center">Navegação</th>
                      <th className="py-3 px-4 text-center">Destaque</th>
                      <th className="py-3 px-4 text-center">Ordem</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C88E9B]/10 text-xs">
                    {citiesList.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FAF5F0]/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#5A4035]">{c.name}</td>
                        <td className="py-3 px-4 font-semibold text-[#5A4035]/80">
                          {c.stateName ? `${c.stateName} (${c.stateUf})` : c.stateUf}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#5A4035]/70">/{c.slug}</td>
                        <td className="py-3 px-4 text-center font-bold">{c.photographersCount || 0}</td>
                        <td className="py-3 px-4 text-center">
                          {c.showInNavigation ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700">
                              Sim
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">Não</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {c.featured ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                              Destaque
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">{c.sortOrder}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleCityStatus(c)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              c.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {c.status === 'active' ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditCity(c)}
                            className="p-1.5 text-[#5A4035] hover:bg-[#FAF5F0] rounded-lg"
                          >
                            <Edit2 className="w-4 h-4 text-[#C7A86A]" />
                          </button>
                          <button
                            onClick={() => handleDeleteCity(c)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {cityTotalPages > 1 && (
              <div className="p-4 bg-[#FAF5F0] border-t border-[#C88E9B]/20 flex items-center justify-between text-xs">
                <span className="text-[#5A4035]/70 font-medium">
                  Página {cityPage} de {cityTotalPages} ({cityTotalCount} cidades)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={cityPage <= 1}
                    onClick={() => setCityPage((p) => p - 1)}
                    className="px-3 py-1.5 bg-white border border-[#C88E9B]/30 rounded-lg font-bold text-[#5A4035] disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={cityPage >= cityTotalPages}
                    onClick={() => setCityPage((p) => p + 1)}
                    className="px-3 py-1.5 bg-white border border-[#C88E9B]/30 rounded-lg font-bold text-[#5A4035] disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATE FORM MODAL */}
      {isStateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-[#C88E9B]/30 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#C88E9B]/20 pb-4">
              <h3 className="text-lg font-serif font-bold text-[#5A4035]">
                {editingState ? 'Editar Estado' : 'Novo Estado'}
              </h3>
              <button onClick={() => setIsStateModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveState} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Nome do Estado *</label>
                  <input
                    type="text"
                    required
                    value={stateFormData.name}
                    onChange={(e) =>
                      setStateFormData((p) => ({
                        ...p,
                        name: e.target.value,
                        slug: p.slug
                          ? p.slug
                          : e.target.value
                              .toLowerCase()
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '')
                              .replace(/[^a-z0-9]+/g, '-'),
                      }))
                    }
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">UF (2 letras) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={stateFormData.uf}
                    onChange={(e) => setStateFormData((p) => ({ ...p, uf: e.target.value.toUpperCase() }))}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Região</label>
                  <select
                    value={stateFormData.region}
                    onChange={(e) => setStateFormData((p) => ({ ...p, region: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 font-bold"
                  >
                    <option value="Sudeste">Sudeste</option>
                    <option value="Sul">Sul</option>
                    <option value="Nordeste">Nordeste</option>
                    <option value="Centro-Oeste">Centro-Oeste</option>
                    <option value="Norte">Norte</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Código IBGE</label>
                  <input
                    type="text"
                    value={stateFormData.ibgeCode}
                    onChange={(e) => setStateFormData((p) => ({ ...p, ibgeCode: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Texto Introdutório</label>
                <textarea
                  rows={2}
                  value={stateFormData.introductoryText}
                  onChange={(e) => setStateFormData((p) => ({ ...p, introductoryText: e.target.value }))}
                  className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30"
                />
              </div>

              <div className="flex items-center gap-4 bg-[#FAF5F0] p-3 rounded-xl border border-[#C88E9B]/20">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#5A4035]">
                  <input
                    type="checkbox"
                    checked={stateFormData.showInNavigation}
                    onChange={(e) => setStateFormData((p) => ({ ...p, showInNavigation: e.target.checked }))}
                    className="w-4 h-4 text-[#C88E9B]"
                  />
                  <span>Exibir no Mapa de Navegação</span>
                </label>

                <select
                  value={stateFormData.status}
                  onChange={(e: any) => setStateFormData((p) => ({ ...p, status: e.target.value }))}
                  className="p-2 bg-white rounded-xl font-bold"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C88E9B]/20">
                <button
                  type="button"
                  onClick={() => setIsStateModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF5F0] rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingState}
                  className="px-6 py-2 bg-[#5A4035] text-white rounded-xl font-bold"
                >
                  Salvar Estado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CITY FORM MODAL */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-[#C88E9B]/30 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#C88E9B]/20 pb-4">
              <h3 className="text-lg font-serif font-bold text-[#5A4035]">
                {editingCity ? 'Editar Cidade' : 'Nova Cidade'}
              </h3>
              <button onClick={() => setIsCityModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveCity} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Estado (UF) *</label>
                  <select
                    value={cityFormData.stateUf}
                    onChange={(e) => {
                      const uf = e.target.value;
                      const matched = statesList.find((s) => s.uf === uf);
                      setCityFormData((p) => ({ ...p, stateUf: uf, stateId: matched ? matched.id : 0 }));
                    }}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 font-bold"
                  >
                    {statesList.map((s) => (
                      <option key={s.uf} value={s.uf}>
                        {s.name} ({s.uf})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Nome da Cidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Piracicaba, Campinas"
                    value={cityFormData.name}
                    onChange={(e) => {
                      const nameVal = e.target.value;
                      const autoSlug = `fotografo-casamento-${nameVal
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')}`;

                      setCityFormData((p) => ({
                        ...p,
                        name: nameVal,
                        slug: editingCity ? p.slug : autoSlug,
                        heroText: p.heroText || (nameVal ? `Fotógrafos de Casamento em ${nameVal}` : ''),
                      }));
                    }}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Slug na URL *</label>
                <input
                  type="text"
                  required
                  value={cityFormData.slug}
                  onChange={(e) => setCityFormData((p) => ({ ...p, slug: e.target.value }))}
                  className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Título Hero</label>
                  <input
                    type="text"
                    placeholder="Ex: Fotógrafos em Piracicaba"
                    value={cityFormData.heroText}
                    onChange={(e) => setCityFormData((p) => ({ ...p, heroText: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={cityFormData.sortOrder}
                    onChange={(e) => setCityFormData((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Texto Introdutório</label>
                <textarea
                  rows={2}
                  value={cityFormData.introductoryText}
                  onChange={(e) => setCityFormData((p) => ({ ...p, introductoryText: e.target.value }))}
                  className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30"
                />
              </div>

              <div className="bg-[#FAF5F0] p-4 rounded-2xl border border-[#C88E9B]/20 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#5A4035]">
                  <input
                    type="checkbox"
                    checked={cityFormData.showInNavigation}
                    onChange={(e) => setCityFormData((p) => ({ ...p, showInNavigation: e.target.checked }))}
                    className="w-4 h-4 text-[#C88E9B]"
                  />
                  <span>Exibir na Navegação por Cidades</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#5A4035]">
                  <input
                    type="checkbox"
                    checked={cityFormData.featured}
                    onChange={(e) => setCityFormData((p) => ({ ...p, featured: e.target.checked }))}
                    className="w-4 h-4 text-[#C88E9B]"
                  />
                  <span>Cidade em Destaque</span>
                </label>

                <select
                  value={cityFormData.status}
                  onChange={(e: any) => setCityFormData((p) => ({ ...p, status: e.target.value }))}
                  className="p-2 bg-white rounded-xl font-bold ml-auto"
                >
                  <option value="active">Status: Ativa</option>
                  <option value="inactive">Status: Inativa</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C88E9B]/20">
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF5F0] rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCity}
                  className="px-6 py-2 bg-[#5A4035] text-white rounded-xl font-bold"
                >
                  Salvar Cidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
