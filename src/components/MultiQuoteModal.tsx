import React, { useEffect, useState } from 'react';
import { X, Sparkles, CheckCircle2, MapPin, Loader2, Crown } from 'lucide-react';
import { Photographer, DeliveryType, StyleType, PricingPackage } from '../types';

interface MultiQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhotographers: Photographer[];
  specificPackage?: PricingPackage;
}

interface QuoteCity {
  city: string;
  state: string;
  photographersCount: number;
}

export const MultiQuoteModal: React.FC<MultiQuoteModalProps> = ({
  isOpen,
  onClose,
  selectedPhotographers,
  specificPackage,
}) => {
  const [formData, setFormData] = useState({
    coupleName: '',
    email: '',
    phone: '',
    whatsapp: '',
    weddingDate: '',
    city: selectedPhotographers[0]?.city || 'Piracicaba',
    state: selectedPhotographers[0]?.state || 'SP',
    venueType: 'Campo / Fazenda',
    estimatedGuests: 120,
    budgetLimit: 5000,
    servicesNeeded: ['Foto', 'Pré Wedding'] as DeliveryType[],
    stylePreference: 'Fine Art' as StyleType,
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [successLead, setSuccessLead] = useState<any>(null);
  const [createAccount, setCreateAccount] = useState(true);
  const [password, setPassword] = useState('');
  const [availableCities, setAvailableCities] = useState<QuoteCity[]>([]);
  const [selectedCityKey, setSelectedCityKey] = useState('');
  const [availablePhotographers, setAvailablePhotographers] = useState<Photographer[]>([]);
  const [selectedPhotographerIds, setSelectedPhotographerIds] = useState<string[]>([]);
  const [selectorLoading, setSelectorLoading] = useState(false);
  const [selectorError, setSelectorError] = useState('');

  const isGuidedMultiQuote = selectedPhotographers.length === 0;
  const effectivePhotographers = isGuidedMultiQuote
    ? availablePhotographers.filter((photographer) => selectedPhotographerIds.includes(String(photographer.id)))
    : selectedPhotographers;

  useEffect(() => {
    if (!isOpen) return;
    setSuccessLead(null);
    setSelectorError('');
    setSelectedPhotographerIds([]);
    setAvailablePhotographers([]);

    if (!isGuidedMultiQuote) {
      setFormData((previous) => ({
        ...previous,
        city: selectedPhotographers[0]?.city || previous.city || '',
        state: selectedPhotographers[0]?.state || previous.state || '',
      }));
      return;
    }

    setSelectedCityKey('');
    setFormData((previous) => ({ ...previous, city: '', state: '' }));
    setSelectorLoading(true);
    fetch('/api/quote/cities')
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok || body.success === false) {
          throw new Error(body.error || 'Não foi possível carregar as cidades.');
        }
        setAvailableCities(Array.isArray(body.cities) ? body.cities : []);
      })
      .catch((error) => {
        setAvailableCities([]);
        setSelectorError(error instanceof Error ? error.message : 'Não foi possível carregar as cidades.');
      })
      .finally(() => setSelectorLoading(false));
  }, [isOpen, isGuidedMultiQuote, selectedPhotographers]);

  useEffect(() => {
    if (!isOpen || !isGuidedMultiQuote || !selectedCityKey) return;
    const [state, city] = selectedCityKey.split('|||');
    if (!state || !city) return;

    setFormData((previous) => ({ ...previous, city, state }));
    setSelectedPhotographerIds([]);
    setAvailablePhotographers([]);
    setSelectorError('');
    setSelectorLoading(true);

    fetch(`/api/photographers?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok || body.success === false) {
          throw new Error(body.error || 'Não foi possível carregar os fotógrafos.');
        }
        setAvailablePhotographers(Array.isArray(body.photographers) ? body.photographers : []);
      })
      .catch((error) => {
        setSelectorError(error instanceof Error ? error.message : 'Não foi possível carregar os fotógrafos.');
      })
      .finally(() => setSelectorLoading(false));
  }, [isOpen, isGuidedMultiQuote, selectedCityKey]);

  if (!isOpen) return null;

  const toggleService = (serv: DeliveryType) => {
    setFormData((prev) => ({
      ...prev,
      servicesNeeded: (() => {
        const currentServices = Array.isArray(prev.servicesNeeded) ? prev.servicesNeeded : [];
        return currentServices.includes(serv)
          ? currentServices.filter((service) => service !== serv)
          : [...currentServices, serv];
      })(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (effectivePhotographers.length === 0) {
      setSelectorError('Selecione pelo menos um fotógrafo para receber a cotação.');
      return;
    }
    setLoading(true);

    try {
      // If user requested account creation and password is provided, attempt registration
      if (createAccount && password) {
        const registrationResponse = await fetch('/api/auth/register-bride', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.coupleName,
            email: formData.email,
            phone: formData.whatsapp,
            password,
            weddingDate: formData.weddingDate,
            weddingCity: formData.city,
          })
        });
        const registration = await registrationResponse.json();
        if (!registrationResponse.ok || registration.success === false) {
          throw new Error(registration.error || 'Não foi possível criar a conta.');
        }
      }

      const payload = {
        ...formData,
        photographerIds: effectivePhotographers.map((p) => p.id),
        specificPackageName: specificPackage?.name || null
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccessLead(data.lead);
      } else {
        alert(data.error || 'Erro ao enviar solicitação.');
      }
    } catch (err) {
      setLoading(false);
      alert(err instanceof Error ? err.message : 'Não foi possível enviar a solicitação.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 space-y-6 shadow-2xl relative border border-[#C88E9B]/30 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#5A4035]/50 hover:text-[#5A4035] p-1 rounded-full hover:bg-[#FAF5F0]"
        >
          <X className="w-6 h-6" />
        </button>

        {successLead ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#5A4035]">
              Solicitação de Orçamento Enviada com Sucesso!
            </h2>
            <p className="text-sm text-[#5A4035]/80 max-w-md mx-auto">
              Sua solicitação foi enviada para{' '}
              <strong className="text-[#C88E9B]">
                {effectivePhotographers.map((p) => p.studioName).join(', ')}
              </strong>
              . Os profissionais entrarão em contato via WhatsApp/Email com as propostas personalizadas.
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setSuccessLead(null);
                  onClose();
                }}
                className="px-8 py-3 bg-[#5A4035] text-white font-bold text-xs rounded-xl hover:bg-[#C88E9B] transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF5F0] rounded-full text-xs font-semibold text-[#5A4035] border border-[#C88E9B]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#C7A86A]" />
                <span>Orçamento Rápido e Seguro</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#5A4035]">
                {isGuidedMultiQuote
                  ? 'Cotação Múltipla por Cidade'
                  : effectivePhotographers.length > 1
                    ? `Solicitar Orçamento Múltiplo (${effectivePhotographers.length} Estúdios)`
                    : `Solicitar Orçamento para ${effectivePhotographers[0]?.studioName || 'Fotógrafo'}`}
              </h2>
              {specificPackage && (
                <p className="text-xs text-[#C88E9B] font-bold">
                  Pacote Selecionado: {specificPackage.name} (R$ {specificPackage.price.toLocaleString('pt-BR')})
                </p>
              )}
            </div>

            {isGuidedMultiQuote ? (
              <div className="bg-[#FAF5F0] p-4 rounded-2xl border border-[#C88E9B]/20 space-y-4">
                <div>
                  <label className="flex items-center gap-2 font-bold text-[#5A4035] mb-1.5">
                    <MapPin className="w-4 h-4 text-[#C88E9B]" />
                    1. Escolha a cidade do casamento
                  </label>
                  <select
                    value={selectedCityKey}
                    onChange={(event) => setSelectedCityKey(event.target.value)}
                    disabled={selectorLoading && availableCities.length === 0}
                    className="w-full p-2.5 bg-white border border-[#5A4035]/20 rounded-xl"
                  >
                    <option value="">Selecione uma cidade...</option>
                    {availableCities.map((city) => (
                      <option key={`${city.state}-${city.city}`} value={`${city.state}|||${city.city}`}>
                        {city.city} - {city.state} ({city.photographersCount} fotógrafo{city.photographersCount === 1 ? '' : 's'})
                      </option>
                    ))}
                  </select>
                </div>

                {selectorLoading && (
                  <div className="flex items-center gap-2 text-[#5A4035]/70">
                    <Loader2 className="w-4 h-4 animate-spin text-[#C88E9B]" />
                    Consultando cadastros reais...
                  </div>
                )}

                {selectorError && (
                  <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                    {selectorError}
                  </p>
                )}

                {!selectorLoading && availableCities.length === 0 && !selectorError && (
                  <p className="text-xs text-[#5A4035]/70">
                    Ainda não há cidades com fotógrafos aprovados para cotação.
                  </p>
                )}

                {selectedCityKey && !selectorLoading && availablePhotographers.length === 0 && !selectorError && (
                  <p className="text-xs text-[#5A4035]/70">
                    Ainda não há fotógrafos aprovados nesta cidade.
                  </p>
                )}

                {availablePhotographers.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-bold text-[#5A4035]">
                      2. Selecione os fotógrafos que receberão o pedido
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                      {availablePhotographers.map((photographer: Photographer & { hasActivePremium?: boolean }) => {
                        const photographerId = String(photographer.id);
                        const selected = selectedPhotographerIds.includes(photographerId);
                        return (
                          <button
                            key={photographerId}
                            type="button"
                            onClick={() => {
                              setSelectorError('');
                              setSelectedPhotographerIds((previous) =>
                                previous.includes(photographerId)
                                  ? previous.filter((id) => id !== photographerId)
                                  : [...previous, photographerId],
                              );
                            }}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              selected
                                ? 'bg-[#C88E9B] border-[#C88E9B] text-white'
                                : 'bg-white border-[#5A4035]/15 text-[#5A4035] hover:border-[#C88E9B]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={photographer.avatar}
                                alt={photographer.name}
                                className="w-9 h-9 rounded-full object-cover bg-[#F6EEE8]"
                              />
                              <div className="min-w-0 flex-1">
                                <span className="font-bold block truncate">{photographer.studioName}</span>
                                <span className={`text-[10px] ${selected ? 'text-white/80' : 'text-[#5A4035]/65'}`}>
                                  {photographer.city} - {photographer.state}
                                </span>
                              </div>
                              {photographer.hasActivePremium && (
                                <Crown className={`w-4 h-4 ${selected ? 'text-[#FFF0B5]' : 'text-[#C7A86A]'}`} />
                              )}
                              <span className="font-bold">{selected ? '✓' : '+'}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-[#5A4035]/60">
                      Assinantes Premium ativos aparecem primeiro.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#FAF5F0] p-3 rounded-2xl border border-[#C88E9B]/20 flex items-center gap-3 overflow-x-auto">
                <span className="text-xs font-bold text-[#5A4035] shrink-0">Para:</span>
                {effectivePhotographers.map((photographer) => (
                  <div key={photographer.id} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#5A4035]/10 shrink-0 text-xs">
                    <img src={photographer.avatar} alt={photographer.name} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-semibold text-[#5A4035]">{photographer.studioName}</span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Nome do Casal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amanda e Rodrigo"
                    value={formData.coupleName}
                    onChange={(e) => setFormData({ ...formData, coupleName: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">WhatsApp com DDD *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: (19) 99876-5432"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="noiva@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Data Prevista do Casamento</label>
                  <input
                    type="date"
                    required
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Cidade do Evento</label>
                  <input
                    type="text"
                    required
                    readOnly={isGuidedMultiQuote}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Convidados Estimados</label>
                  <input
                    type="number"
                    value={formData.estimatedGuests}
                    onChange={(e) => setFormData({ ...formData, estimatedGuests: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Teto de Orçamento (R$)</label>
                  <input
                    type="number"
                    step={500}
                    value={formData.budgetLimit}
                    onChange={(e) => setFormData({ ...formData, budgetLimit: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Services Needed Checkboxes */}
              <div>
                <label className="block font-bold text-[#5A4035] mb-1.5">Serviços Desejados:</label>
                <div className="flex flex-wrap gap-2">
                  {['Foto', 'Vídeo', 'Drone', 'Álbum', 'Making Of', 'Pré Wedding'].map((serv) => {
                    const isChecked = formData.servicesNeeded.includes(serv as any);
                    return (
                      <button
                        key={serv}
                        type="button"
                        aria-pressed={isChecked}
                        onClick={() => toggleService(serv as any)}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                          isChecked
                            ? 'bg-[#C88E9B] text-white shadow-xs'
                            : 'bg-[#FAF5F0] text-[#5A4035] border border-[#5A4035]/20'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '} {serv}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Mensagem Adicional para o Fotógrafo:</label>
                <textarea
                  rows={2}
                  placeholder="Conte um pouco sobre o horário da cerimônia, estilo do vestido, ou se o casamento será na praia/campo..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                ></textarea>
              </div>

              {/* Seamless Bride Account Creation Box */}
              <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-[#C88E9B]/30 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#5A4035] text-xs">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="w-4 h-4 text-[#C88E9B] rounded focus:ring-[#C88E9B]"
                  />
                  <span>Criar minha conta de Noiva gratuitamente para acompanhar respostas</span>
                </label>

                {createAccount && (
                  <div className="pt-1">
                    <label className="block font-bold text-[#5A4035] mb-1 text-[11px]">
                      Crie uma Senha para Acessar o Portal do Casal:
                    </label>
                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 bg-white border border-[#5A4035]/20 rounded-xl text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || effectivePhotographers.length === 0}
                  className="w-full py-3.5 bg-gradient-to-r from-[#C88E9B] to-[#b07885] hover:from-[#b07885] hover:to-[#5A4035] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 text-[#C7A86A]" />
                  <span>{loading ? 'Enviando orçamentos...' : 'Enviar Solicitação Gratuitamente'}</span>
                </button>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
};
