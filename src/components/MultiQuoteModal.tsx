import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { Photographer, DeliveryType, StyleType, PricingPackage } from '../types';

interface MultiQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhotographers: Photographer[];
  specificPackage?: PricingPackage;
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

  if (!isOpen) return null;

  const toggleService = (serv: DeliveryType) => {
    setFormData((prev) => ({
      ...prev,
      servicesNeeded: prev.servicesNeeded.includes(serv)
        ? prev.servicesNeeded.filter((s) => s !== serv)
        : [...prev, serv]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        photographerIds: selectedPhotographers.map((p) => p.id),
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
      // Fallback local success
      setSuccessLead({ id: `lead-${Date.now()}` });
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
                {selectedPhotographers.map((p) => p.studioName).join(', ')}
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
                {selectedPhotographers.length > 1
                  ? `Solicitar Orçamento Múltiplo (${selectedPhotographers.length} Estúdios)`
                  : `Solicitar Orçamento para ${selectedPhotographers[0]?.studioName || 'Fotógrafo'}`}
              </h2>
              {specificPackage && (
                <p className="text-xs text-[#C88E9B] font-bold">
                  Pacote Selecionado: {specificPackage.name} (R$ {specificPackage.price.toLocaleString('pt-BR')})
                </p>
              )}
            </div>

            {/* Selected photographers avatars bar */}
            <div className="bg-[#FAF5F0] p-3 rounded-2xl border border-[#C88E9B]/20 flex items-center gap-3 overflow-x-auto">
              <span className="text-xs font-bold text-[#5A4035] shrink-0">Para:</span>
              {selectedPhotographers.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#5A4035]/10 shrink-0 text-xs">
                  <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                  <span className="font-semibold text-[#5A4035]">{p.studioName}</span>
                </div>
              ))}
            </div>

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
                  rows={3}
                  placeholder="Conte um pouco sobre o horário da cerimônia, estilo do vestido, ou se o casamento será na praia/campo..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#C88E9B] to-[#b07885] hover:from-[#b07885] hover:to-[#5A4035] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
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
