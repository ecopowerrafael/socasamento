import React, { useState, useEffect } from 'react';
import { UserCheck, MessageSquare, Eye, Phone, DollarSign, ShieldCheck, Check, Sparkles, Filter, Edit3, Image as ImageIcon, Plus, Trash2, ArrowLeft, ArrowRight, Star, Upload, MoveLeft, MoveRight } from 'lucide-react';
import { Photographer, PhotoItem } from '../types';

interface PhotographerPanelProps {
  photographer: Photographer;
  onUpdatePhotographer: (p: Photographer) => void;
}

export const PhotographerPanel: React.FC<PhotographerPanelProps> = ({
  photographer,
  onUpdatePhotographer,
}) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'edit-profile' | 'stats'>('leads');
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Edit profile form state
  const [editBio, setEditBio] = useState(photographer.bioFull);
  const [editStartingPrice, setEditStartingPrice] = useState(photographer.priceStartingFrom);
  const [editPhone, setEditPhone] = useState(photographer.phone);

  // Edit Work Photos / Gallery mockup state
  const [galleryList, setGalleryList] = useState<PhotoItem[]>(photographer.gallery || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<'Cerimônia' | 'Making Of' | 'Pré Wedding' | 'Festa' | 'Drone' | 'Álbuns'>('Cerimônia');
  const [newPhotoFeatured, setNewPhotoFeatured] = useState(false);

  // Preset sample wedding photo URLs for mockup
  const presetPhotos = [
    { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', caption: 'Cerimônia ao ar livre na fazenda', category: 'Cerimônia' },
    { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80', caption: 'Ensaio Pré Wedding romantico', category: 'Pré Wedding' },
    { url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', caption: 'Making Of e maquiagem da noiva', category: 'Making Of' },
    { url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80', caption: 'Primeira dança com fogos e luzes', category: 'Festa' },
    { url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80', caption: 'Drone vista aérea da cerimônia', category: 'Drone' },
  ];

  useEffect(() => {
    fetch('/api/leads?photographerId=' + photographer.id)
      .then((res) => res.json())
      .then((data) => {
        if (data.leads) {
          setLeadsList(data.leads);
        }
        setLoadingLeads(false);
      })
      .catch(() => setLoadingLeads(false));
  }, [photographer.id]);

  const updateLeadStatus = (leadId: string, newStatus: string) => {
    setLeadsList((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    const newItem: PhotoItem = {
      id: 'g_' + Date.now(),
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || 'Foto de Casamento',
      category: newPhotoCategory,
      featured: newPhotoFeatured
    };

    setGalleryList((prev) => [newItem, ...prev]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setNewPhotoFeatured(false);
  };

  const handleRemovePhoto = (id: string) => {
    setGalleryList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleFeaturedPhoto = (id: string) => {
    setGalleryList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, featured: !item.featured } : item
      )
    );
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryList.length) return;
    const newArr = [...galleryList];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    setGalleryList(newArr);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Photographer = {
      ...photographer,
      bioFull: editBio,
      priceStartingFrom: editStartingPrice,
      phone: editPhone,
      gallery: galleryList
    };
    onUpdatePhotographer(updated);
    alert('Perfil e galeria de trabalhos atualizados com sucesso no portal!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-[#5A4035] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img src={photographer.avatar} alt={photographer.name} className="w-16 h-16 rounded-2xl border-2 border-white object-cover" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold">{photographer.studioName}</h1>
              <span className="bg-[#C7A86A] text-[#5A4035] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {photographer.plan}
              </span>
            </div>
            <p className="text-xs text-white/80">Painel do Fotógrafo • Cidade: {photographer.city} - {photographer.state}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/15 text-xs">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'leads' ? 'bg-[#C88E9B] text-white' : 'text-white/80 hover:text-white'
            }`}
          >
            Leads / Orçamentos ({leadsList.length})
          </button>

          <button
            onClick={() => setActiveTab('edit-profile')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'edit-profile' ? 'bg-[#C88E9B] text-white' : 'text-white/80 hover:text-white'
            }`}
          >
            Editar Perfil
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
          <span className="text-xs font-bold text-[#5A4035]/60 uppercase block">Visualizações no Mês</span>
          <span className="text-2xl font-serif font-bold text-[#5A4035]">1.420</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">↑ +18% em relação ao mês anterior</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
          <span className="text-xs font-bold text-[#5A4035]/60 uppercase block">Cliques no WhatsApp</span>
          <span className="text-2xl font-serif font-bold text-[#5A4035]">84</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">↑ Altamente qualificados</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
          <span className="text-xs font-bold text-[#5A4035]/60 uppercase block">Orçamentos Recebidos</span>
          <span className="text-2xl font-serif font-bold text-[#5A4035]">{leadsList.length}</span>
          <span className="text-[10px] text-[#C88E9B] font-semibold block mt-1">Leads via Portal</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
          <span className="text-xs font-bold text-[#5A4035]/60 uppercase block">Selo de Qualidade</span>
          <span className="text-sm font-bold text-[#C7A86A] flex items-center gap-1 mt-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Auditado & Verificado</span>
          </span>
        </div>
      </div>

      {/* Tab Content: Leads CRM */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#C88E9B]/20 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#5A4035]">CRM de Oportunidades & Leads Recebidos</h2>
              <p className="text-xs text-[#5A4035]/70">Responda diretamente aos noivos via WhatsApp ou Email</p>
            </div>
            <span className="text-xs font-bold text-[#5A4035] bg-[#FAF5F0] px-3 py-1 rounded-full">
              {leadsList.length} Noivos aguardando
            </span>
          </div>

          <div className="space-y-4">
            {leadsList.map((lead) => (
              <div key={lead.id} className="bg-[#FAF5F0] p-5 rounded-2xl border border-[#C88E9B]/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#5A4035]/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[#5A4035]">{lead.coupleName}</h3>
                      <span className="bg-[#5A4035] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A4035]/70">
                      Data do Casamento: <strong>{lead.weddingDate}</strong> • Cidade: {lead.city} ({lead.estimatedGuests} convidados)
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    className="px-3 py-1 bg-white border border-[#5A4035]/20 rounded-xl text-xs font-bold text-[#5A4035]"
                  >
                    <option value="Novo">Novo</option>
                    <option value="Em Atendimento">Em Atendimento</option>
                    <option value="Proposta Enviada">Proposta Enviada</option>
                    <option value="Fechado">Fechado 🎉</option>
                    <option value="Perdido">Perdido</option>
                  </select>
                </div>

                <p className="text-xs text-[#5A4035]/90 italic bg-white p-3 rounded-xl border border-[#5A4035]/10">
                  "{lead.message || 'Solicitação de orçamento enviada pelo portal.'}"
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  <div className="space-x-2 text-[#5A4035]/80">
                    <span>Teto de Orçamento: <strong>R$ {lead.budgetLimit?.toLocaleString('pt-BR')}</strong></span>
                    <span>• Serviços: <strong>{Array.isArray(lead.servicesNeeded) ? lead.servicesNeeded.join(', ') : 'Foto'}</strong></span>
                  </div>

                  <a
                    href={`https://wa.me/${lead.whatsapp?.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(lead.coupleName)}!%20Recebi%20sua%20solicita%C3%A7%C3%A3o%20pelo%20S%C3%B3%20Fot%C3%B3grafos%20de%20Casamento.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1ebd59] flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-white" />
                    <span>Chamar no WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Edit Profile */}
      {activeTab === 'edit-profile' && (
        <div className="space-y-8">
          
          {/* Main Info Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#5A4035] border-b border-[#C88E9B]/20 pb-3 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#C88E9B]" />
              <span>Editar Informações do Perfil Público</span>
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Apresentação / Bio Completa:</label>
                <textarea
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-3 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Preço Inicial (R$):</label>
                  <input
                    type="number"
                    value={editStartingPrice}
                    onChange={(e) => setEditStartingPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Telefone Comercial:</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#C88E9B] text-white font-bold rounded-xl hover:bg-[#b07885] transition-colors shadow-sm"
                >
                  Salvar Perfil Completo
                </button>
              </div>
            </form>
          </div>

          {/* WORK PHOTOS GALLERY MANAGEMENT MOCKUP */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C88E9B]/20 pb-4">
              <div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#C88E9B] uppercase tracking-wider mb-1">
                  <ImageIcon className="w-4 h-4 text-[#C7A86A]" />
                  <span>Gerenciador de Portfólio (Mockup)</span>
                </div>
                <h2 className="text-xl font-serif font-bold text-[#5A4035]">
                  Editar Fotos dos Trabalhos e Galeria
                </h2>
                <p className="text-xs text-[#5A4035]/70">
                  Adicione, ordene, destaque e organize as fotos que as noivas verão na sua página
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5A4035] bg-[#FAF5F0] px-3 py-1.5 rounded-full border border-[#C88E9B]/20">
                  {galleryList.length} Fotos no Portfólio
                </span>
              </div>
            </div>

            {/* Form: Add New Photo */}
            <form onSubmit={handleAddPhoto} className="bg-[#FAF5F0] p-5 rounded-2xl border border-[#C88E9B]/20 space-y-4">
              <h3 className="font-bold text-sm text-[#5A4035] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#C88E9B]" />
                <span>Adicionar Nova Foto ao Portfólio</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block font-semibold text-[#5A4035] mb-1">URL da Imagem:</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#5A4035]/20 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5A4035] mb-1">Título / Legenda da Foto:</label>
                  <input
                    type="text"
                    placeholder="Ex: Entrada da noiva com vestido boho..."
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#5A4035]/20 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5A4035] mb-1">Categoria do Trabalho:</label>
                  <select
                    value={newPhotoCategory}
                    onChange={(e: any) => setNewPhotoCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#5A4035]/20 rounded-xl font-medium"
                  >
                    <option value="Cerimônia">Cerimônia</option>
                    <option value="Making Of">Making Of</option>
                    <option value="Pré Wedding">Pré Wedding</option>
                    <option value="Festa">Festa</option>
                    <option value="Drone">Drone</option>
                    <option value="Álbuns">Álbuns</option>
                  </select>
                </div>
              </div>

              {/* Quick Presets for Easy Mockup Testing */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-[#5A4035]/10">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[#5A4035]">
                    <input
                      type="checkbox"
                      checked={newPhotoFeatured}
                      onChange={(e) => setNewPhotoFeatured(e.target.checked)}
                      className="rounded text-[#C88E9B] focus:ring-[#C88E9B]"
                    />
                    <span>Marcar como Destaque Capa (Featured)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#5A4035] text-white font-bold rounded-xl hover:bg-[#432e26] transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-[#C7A86A]" />
                    <span>Adicionar Foto</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#5A4035]/70 block mb-1">Ou clique para adicionar foto modelo de teste:</span>
                <div className="flex flex-wrap gap-1.5">
                  {presetPhotos.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewPhotoUrl(preset.url);
                        setNewPhotoCaption(preset.caption);
                        setNewPhotoCategory(preset.category as any);
                      }}
                      className="px-2.5 py-1 bg-white border border-[#C88E9B]/30 hover:border-[#C88E9B] text-[10px] font-semibold text-[#5A4035] rounded-lg transition-colors"
                    >
                      + {preset.category}: {preset.caption}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Existing Photos Grid */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-[#5A4035]">Fotos do Trabalhos Cadastradas</h3>
              
              {galleryList.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#5A4035]/60 bg-[#FAF5F0] rounded-2xl border border-dashed border-[#5A4035]/20">
                  Nenhuma foto cadastrada na galeria ainda. Adicione fotos acima!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryList.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="bg-[#FAF5F0] rounded-2xl border border-[#C88E9B]/20 overflow-hidden shadow-xs space-y-3 p-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="relative h-44 rounded-xl overflow-hidden bg-black/5">
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-[#5A4035] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {photo.category}
                          </span>
                          {photo.featured && (
                            <span className="absolute top-2 right-2 bg-[#C7A86A] text-[#5A4035] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <Star className="w-3 h-3 fill-[#5A4035]" />
                              Destaque
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-xs text-[#5A4035] line-clamp-1">{photo.caption}</p>
                          <span className="text-[10px] text-[#5A4035]/60">Posição: #{index + 1}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#5A4035]/10 flex items-center justify-between gap-1 text-xs">
                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMovePhoto(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 bg-white border border-[#5A4035]/20 rounded-lg text-[#5A4035] disabled:opacity-30 hover:bg-[#F6EEE8]"
                            title="Mover para esquerda/cima"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMovePhoto(index, 'down')}
                            disabled={index === galleryList.length - 1}
                            className="p-1.5 bg-white border border-[#5A4035]/20 rounded-lg text-[#5A4035] disabled:opacity-30 hover:bg-[#F6EEE8]"
                            title="Mover para direita/baixo"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Toggle Featured */}
                        <button
                          type="button"
                          onClick={() => handleToggleFeaturedPhoto(photo.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                            photo.featured ? 'bg-[#C7A86A] text-[#5A4035]' : 'bg-white border border-[#5A4035]/20 text-[#5A4035]/70'
                          }`}
                        >
                          <Star className={`w-3 h-3 ${photo.featured ? 'fill-[#5A4035]' : ''}`} />
                          <span>{photo.featured ? 'Destaque' : '+ Destaque'}</span>
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100"
                          title="Excluir Foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#C88E9B]/20 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-6 py-3 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold rounded-xl transition-colors text-xs flex items-center gap-2 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações de Fotos do Perfil</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
