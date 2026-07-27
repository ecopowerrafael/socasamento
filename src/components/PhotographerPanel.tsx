import React, { useState, useEffect } from 'react';
import { UserCheck, MessageSquare, Eye, Phone, DollarSign, ShieldCheck, Check, Sparkles, Filter, Edit3, Image as ImageIcon, Plus, Trash2, ArrowLeft, ArrowRight, Star, Upload, MoveLeft, MoveRight, LogOut, CreditCard } from 'lucide-react';
import { Photographer, PhotoItem, CategoryType } from '../types';
import { PhotographerSubscriptionTab } from './PhotographerSubscriptionTab';

interface PhotographerPanelProps {
  photographer: Photographer;
  onUpdatePhotographer: (p: Photographer) => void;
  onLogout?: () => void;
}

export const PhotographerPanel: React.FC<PhotographerPanelProps> = ({
  photographer,
  onUpdatePhotographer,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'edit-profile' | 'subscription' | 'stats'>('leads');
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Edit profile form state
  const [editBio, setEditBio] = useState(photographer.bioFull);
  const [editStartingPrice, setEditStartingPrice] = useState(
    Number.isFinite(Number(photographer.priceStartingFrom)) ? Number(photographer.priceStartingFrom) : 0,
  );
  const [editPhone, setEditPhone] = useState(photographer.phone);
  const [editWhatsapp, setEditWhatsapp] = useState(photographer.whatsapp || '');
  const [editEmail, setEditEmail] = useState(photographer.email || '');
  const [editInstagram, setEditInstagram] = useState(photographer.instagram || '');
  const [editWebsite, setEditWebsite] = useState(photographer.website || '');
  const [editYearsExperience, setEditYearsExperience] = useState(Number(photographer.yearsExperience) || 0);
  const [editWeddingsCompleted, setEditWeddingsCompleted] = useState(Number(photographer.weddingsCompleted) || 0);
  const [editCategories, setEditCategories] = useState<CategoryType[]>(photographer.categories || []);
  const [editServiceCities, setEditServiceCities] = useState<string[]>(
    photographer.serviceCities?.length ? photographer.serviceCities : [`${photographer.city} - ${photographer.state}`],
  );
  const [newServiceCity, setNewServiceCity] = useState('');
  const [newServiceState, setNewServiceState] = useState(photographer.state || 'SP');
  const [availableCategories, setAvailableCategories] = useState<CategoryType[]>([]);
  const [planPermissions, setPlanPermissions] = useState<Record<string, boolean | number | string | null>>(
    photographer.planPermissions || {},
  );
  const [editAvatar, setEditAvatar] = useState(photographer.avatar);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Edit Work Photos / Gallery state backed by MySQL
  const [galleryList, setGalleryList] = useState<PhotoItem[]>(photographer.gallery || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<'Cerimônia' | 'Making Of' | 'Pré Wedding' | 'Festa' | 'Drone' | 'Álbuns'>('Cerimônia');
  const [newPhotoFeatured, setNewPhotoFeatured] = useState(false);
  const [uploadingGalleryPhoto, setUploadingGalleryPhoto] = useState(false);

  const uploadImageFile = async (file: File) => {
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!supportedTypes.includes(file.type)) throw new Error('Escolha uma imagem JPG, PNG ou WebP.');
    if (file.size > 5 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 5 MB.');

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
      reader.readAsDataURL(file);
    });
    const response = await fetch('/api/uploads/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl }),
    });
    const result = await response.json();
    if (!response.ok || result.success === false) throw new Error(result.error || 'Não foi possível enviar a imagem.');
    return String(result.url);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      setEditAvatar(await uploadImageFile(file));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível enviar a foto de perfil.');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

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

  useEffect(() => {
    Promise.all([
      fetch(`/api/photographer/subscription?photographerId=${photographer.id}`).then((response) => response.json()),
      fetch('/api/categories').then((response) => response.json()),
    ]).then(([subscriptionData, categoryData]) => {
      if (subscriptionData?.effectivePlan?.permissions) {
        setPlanPermissions(subscriptionData.effectivePlan.permissions);
      }
      if (Array.isArray(categoryData?.categories)) {
        setAvailableCategories(categoryData.categories.map((category: { name: string }) => category.name as CategoryType));
      }
    }).catch(() => undefined);
  }, [photographer.id]);

  // Dynamic plan permissions logic
  const isPremiumPlan = String(photographer.plan || '').includes('Premium');
  const monthlyLeadsLimit = Number(planPermissions.monthly_leads_limit ?? (isPremiumPlan ? -1 : 5));
  const galleryPhotosLimit = Number(planPermissions.gallery_photos_limit ?? planPermissions.max_photos ?? -1);
  const categoriesLimit = Number(planPermissions.categories_limit ?? 1);
  const serviceCitiesLimit = Number(planPermissions.service_cities_limit ?? planPermissions.max_cities ?? 1);
  const canSeeLeadContactDetails = Boolean(planPermissions.see_lead_contact_details);
  const respondedLeadsCount = leadsList.filter((l) => l.status !== 'Novo').length;
  const isLimitReached = !isPremiumPlan && monthlyLeadsLimit > 0 && respondedLeadsCount >= monthlyLeadsLimit;

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    // Check limit if trying to transition from Novo to something else
    const targetLead = leadsList.find((l) => l.id === leadId);
    if (!isPremiumPlan && isLimitReached && targetLead?.status === 'Novo' && newStatus !== 'Novo') {
      setShowUpgradeModal(true);
      return;
    }

    const response = await fetch(`/api/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const result = await response.json();
    if (!response.ok || result.success === false) {
      alert(result.error || 'Não foi possível atualizar o orçamento.');
      return;
    }
    setLeadsList((previous) =>
      previous.map((lead) => String(lead.id) === String(leadId) ? result.lead : lead)
    );
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() && !newPhotoFile) return;
    if (galleryPhotosLimit >= 0 && galleryList.length >= galleryPhotosLimit) {
      alert(`Seu plano permite até ${galleryPhotosLimit} fotos na galeria.`);
      return;
    }

    let photoUrl = newPhotoUrl.trim();
    try {
      if (newPhotoFile) {
        setUploadingGalleryPhoto(true);
        photoUrl = await uploadImageFile(newPhotoFile);
      }

      const response = await fetch(`/api/photographers/${photographer.id}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: photoUrl,
          caption: newPhotoCaption.trim() || 'Foto de Casamento',
          category: newPhotoCategory,
          featured: newPhotoFeatured,
          sortOrder: 0,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) throw new Error(result.error || 'Não foi possível adicionar a foto.');
      setGalleryList((previous) => [{ ...result.media, id: String(result.media.id) }, ...previous]);
      setNewPhotoUrl('');
      setNewPhotoFile(null);
      setNewPhotoCaption('');
      setNewPhotoFeatured(false);
      alert('Foto adicionada e salva no portfólio.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível adicionar a foto.');
    } finally {
      setUploadingGalleryPhoto(false);
    }
  };

  const handleRemovePhoto = async (id: string) => {
    const response = await fetch(`/api/photographers/media/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok || result.success === false) {
      alert(result.error || 'Não foi possível excluir a foto.');
      return;
    }
    setGalleryList((previous) => previous.filter((item) => item.id !== id));
  };

  const handleToggleFeaturedPhoto = async (id: string) => {
    const current = galleryList.find((item) => item.id === id);
    if (!current) return;
    const response = await fetch(`/api/photographers/media/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !current.featured }),
    });
    const result = await response.json();
    if (!response.ok || result.success === false) {
      alert(result.error || 'Não foi possível atualizar a foto.');
      return;
    }
    setGalleryList((previous) =>
      previous.map((item) => item.id === id ? { ...item, featured: Boolean(result.media.featured) } : item)
    );
  };

  const handleMovePhoto = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryList.length) return;
    const newArr = [...galleryList];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    setGalleryList(newArr);
    await Promise.all(
      newArr.map((item, sortOrder) =>
        fetch(`/api/photographers/media/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder }),
        })
      )
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const safeStartingPrice = Number.isFinite(editStartingPrice) ? Math.max(0, Math.round(editStartingPrice)) : 0;
    const updated: Photographer = {
      ...photographer,
      bioFull: editBio,
      priceStartingFrom: safeStartingPrice,
      phone: editPhone,
      whatsapp: editWhatsapp,
      email: editEmail,
      instagram: editInstagram,
      website: editWebsite,
      yearsExperience: Math.max(0, Math.round(editYearsExperience || 0)),
      weddingsCompleted: Math.max(0, Math.round(editWeddingsCompleted || 0)),
      categories: editCategories,
      serviceCities: editServiceCities,
      avatar: editAvatar.trim() || photographer.avatar,
      gallery: galleryList
    };
    const response = await fetch('/api/photographers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    const result = await response.json();
    if (!response.ok || result.success === false) {
      alert(result.error || 'Não foi possível salvar o perfil.');
      return;
    }
    onUpdatePhotographer({ ...updated, ...result.photographer, gallery: galleryList });
    alert('Perfil público atualizado com sucesso no portal!');
  };

  const toggleCategory = (category: CategoryType) => {
    setEditCategories((current) => {
      if (current.includes(category)) return current.filter((item) => item !== category);
      if (categoriesLimit >= 0 && current.length >= categoriesLimit) {
        alert(`Seu plano permite selecionar até ${categoriesLimit} categoria${categoriesLimit === 1 ? '' : 's'}.`);
        return current;
      }
      return [...current, category];
    });
  };

  const addServiceCity = () => {
    const city = newServiceCity.trim();
    if (!city) return;
    const formatted = `${city} - ${newServiceState}`;
    if (editServiceCities.some((item) => item.toLocaleLowerCase('pt-BR') === formatted.toLocaleLowerCase('pt-BR'))) return;
    if (serviceCitiesLimit >= 0 && editServiceCities.length >= serviceCitiesLimit) {
      alert(`Seu plano permite cadastrar até ${serviceCitiesLimit} cidade${serviceCitiesLimit === 1 ? '' : 's'} de atuação.`);
      return;
    }
    setEditServiceCities((current) => [...current, formatted]);
    setNewServiceCity('');
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

          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'subscription' ? 'bg-[#C88E9B] text-white shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Minha Assinatura</span>
          </button>

          {onLogout && (
            <>
              <div className="h-6 w-px bg-white/20 my-auto" />
              <button
                onClick={onLogout}
                className="px-3.5 py-2 rounded-xl font-bold bg-red-500/20 text-red-200 hover:bg-red-500/40 hover:text-white transition-all flex items-center gap-1.5"
                title="Sair do Painel do Fotógrafo"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
          <span className="text-xs font-bold text-[#5A4035]/60 uppercase block">Avaliações publicadas</span>
          <span className="text-2xl font-serif font-bold text-[#5A4035]">{photographer.reviewCount || 0}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Dados atuais do perfil</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
          <span className="text-xs font-bold text-[#5A4035]/60 uppercase block">Cliques no WhatsApp</span>
          <span className="text-2xl font-serif font-bold text-[#5A4035]">{(photographer as any).whatsappClicks || 0}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Cliques registrados no portal</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
          <span className="text-xs font-bold text-[#5A4035]/60 uppercase block">Orçamentos Recebidos</span>
          <span className="text-2xl font-serif font-bold text-[#5A4035]">{leadsList.length}</span>
          <span className="text-[10px] text-[#C88E9B] font-semibold block mt-1">Leads via Portal</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
          <span className="text-xs font-bold text-[#5A4035]/60 uppercase block">Selo de Qualidade</span>
          {Boolean(planPermissions.verified_badge) ? (
            <span className="text-sm font-bold text-[#C7A86A] flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Auditado & Verificado</span>
            </span>
          ) : (
            <span className="text-sm font-bold text-[#5A4035]/55 block mt-1">Não incluído no plano atual</span>
          )}
        </div>
      </div>

      {/* Tab Content: Leads CRM */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#C88E9B]/20 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#5A4035]">CRM de Oportunidades & Leads Recebidos</h2>
              <p className="text-xs text-[#5A4035]/70">
                Plano Atual: <strong className="uppercase text-[#C88E9B]">{photographer.plan}</strong>
                {!isPremiumPlan && (
                  <span> • Respostas este mês: <strong>{respondedLeadsCount} / {monthlyLeadsLimit}</strong></span>
                )}
              </p>
            </div>
            <span className="text-xs font-bold text-[#5A4035] bg-[#FAF5F0] px-3 py-1 rounded-full">
              {leadsList.length} Noivos aguardando
            </span>
          </div>

          {/* Plan Limit Warning Banner */}
          {!isPremiumPlan && isLimitReached && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold">Limite de respostas atingido no Plano Gratuito ({monthlyLeadsLimit} leads/mês)</p>
                  <p className="text-amber-700">Para visualizar os telefones de novos noivos e enviar propostas ilimitadas, faça upgrade para o Plano Premium.</p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2 bg-[#C88E9B] text-white font-bold rounded-xl hover:bg-[#b07582] shrink-0 transition-all shadow-xs"
              >
                Ativar Plano Premium
              </button>
            </div>
          )}

          <div className="space-y-4">
            {leadsList.map((lead) => {
              const isLockedForFree = !canSeeLeadContactDetails || (!isPremiumPlan && isLimitReached && lead.status === 'Novo');

              return (
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

                    {isLockedForFree ? (
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="px-4 py-2 bg-stone-300 text-stone-700 font-bold rounded-xl hover:bg-stone-400 flex items-center gap-1.5 transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Desbloquear WhatsApp (Plano Premium)</span>
                      </button>
                    ) : (
                      <a
                        href={`https://wa.me/${lead.whatsapp?.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(lead.coupleName)}!%20Recebi%20sua%20solicita%C3%A7%C3%A3o%20pelo%20S%C3%B3%20Fot%C3%B3grafos%20de%20Casamento.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1ebd59] flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-white" />
                        <span>Chamar no WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upgrade Modal Banner */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-100 space-y-5 text-center">
            <div className="w-14 h-14 bg-rose-50 text-[#C88E9B] rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#5A4035]">Desbloqueie Contatos Ilimitados</h3>
            <p className="text-xs text-stone-600">
              No Plano Gratuito, você atingiu o limite de {monthlyLeadsLimit} respostas de noivos este mês.
              Faça upgrade para o <strong>Plano Premium</strong> para liberar o número direto do WhatsApp, destaque nas buscas locais e galeria de fotos ilimitada!
            </p>
            <div className="p-4 bg-[#FAF5F0] rounded-2xl border border-[#C88E9B]/20 text-xs font-bold text-[#5A4035] space-y-1 text-left">
              <p className="text-[#C88E9B]">✓ Respostas Ilimitadas a Noivos</p>
              <p className="text-[#C88E9B]">✓ Botão Direto de WhatsApp no Perfil</p>
              <p className="text-[#C88E9B]">✓ Destaque com Selo Verificado em Topo de Busca</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2.5 text-stone-500 hover:text-stone-700 font-medium text-xs"
              >
                Voltar
              </button>
              <a
                href="/planos"
                className="px-6 py-2.5 bg-[#C88E9B] hover:bg-[#b07582] text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                Conhecer Planos Premium
              </a>
            </div>
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

              <div className="rounded-2xl border border-[#C88E9B]/20 bg-[#FAF5F0] p-4">
                <label className="block font-bold text-[#5A4035] mb-2">Foto do Perfil:</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <img
                    src={editAvatar.trim() || photographer.avatar}
                    alt="Prévia da foto de perfil"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm bg-white"
                  />
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="https://exemplo.com/minha-foto.jpg"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#5A4035]/20 rounded-xl"
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#5A4035] text-white font-bold rounded-xl cursor-pointer hover:bg-[#432e26] transition-colors">
                        <Upload className="w-3.5 h-3.5 text-[#C7A86A]" />
                        <span>{uploadingAvatar ? 'Enviando foto...' : 'Enviar foto do computador'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="sr-only"
                        />
                      </label>
                      <span className="text-[10px] text-[#5A4035]/65">JPG, PNG ou WebP, até 5 MB.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Preço Inicial (R$):</label>
                  <input
                    type="number"
                    min="0"
                    value={editStartingPrice}
                    onChange={(e) => setEditStartingPrice(e.target.value === '' ? 0 : Number(e.target.value))}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Anos de Experiência:</label>
                  <input
                    type="number"
                    min="0"
                    value={editYearsExperience}
                    onChange={(e) => setEditYearsExperience(Number(e.target.value) || 0)}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Casamentos Cobertos:</label>
                  <input
                    type="number"
                    min="0"
                    value={editWeddingsCompleted}
                    onChange={(e) => setEditWeddingsCompleted(Number(e.target.value) || 0)}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">WhatsApp:</label>
                  <input type="text" value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">E-mail de Contato:</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Instagram:</label>
                  <input type="text" value={editInstagram} onChange={(e) => setEditInstagram(e.target.value)} className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Site:</label>
                  <input type="text" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl" />
                </div>
              </div>

              <div className="rounded-2xl border border-[#C88E9B]/20 bg-[#FAF5F0] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold text-[#5A4035]">Categorias de Serviço:</label>
                  <span className="text-[10px] text-[#5A4035]/65">
                    {editCategories.length} / {categoriesLimit < 0 ? 'ilimitadas' : categoriesLimit}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((category) => {
                    const selected = editCategories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1.5 rounded-xl font-semibold border ${selected ? 'bg-[#C88E9B] text-white border-[#C88E9B]' : 'bg-white text-[#5A4035] border-[#5A4035]/20'}`}
                      >
                        {selected ? '✓ ' : '+ '}{category}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-[#C88E9B]/20 bg-[#FAF5F0] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold text-[#5A4035]">Cidades de Atuação:</label>
                  <span className="text-[10px] text-[#5A4035]/65">
                    {editServiceCities.length} / {serviceCitiesLimit < 0 ? 'ilimitadas' : serviceCitiesLimit}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editServiceCities.map((city) => (
                    <span key={city} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#C88E9B]/30 rounded-xl font-semibold text-[#5A4035]">
                      {city}
                      <button type="button" onClick={() => setEditServiceCities((current) => current.filter((item) => item !== city))} className="text-red-600" aria-label={`Remover ${city}`}>×</button>
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_90px_auto] gap-2">
                  <input type="text" placeholder="Nome da cidade" value={newServiceCity} onChange={(e) => setNewServiceCity(e.target.value)} className="p-2.5 bg-white border border-[#5A4035]/20 rounded-xl" />
                  <select value={newServiceState} onChange={(e) => setNewServiceState(e.target.value)} className="p-2.5 bg-white border border-[#5A4035]/20 rounded-xl">
                    {'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                  <button type="button" onClick={addServiceCity} className="px-4 py-2.5 bg-[#5A4035] text-white font-bold rounded-xl">Adicionar</button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={uploadingAvatar}
                  className="px-6 py-3 bg-[#C88E9B] text-white font-bold rounded-xl hover:bg-[#b07885] transition-colors shadow-sm"
                >
                  Salvar Perfil Completo
                </button>
              </div>
            </form>
          </div>

          {/* WORK PHOTOS GALLERY MANAGEMENT */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C88E9B]/20 pb-4">
              <div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#C88E9B] uppercase tracking-wider mb-1">
                  <ImageIcon className="w-4 h-4 text-[#C7A86A]" />
                  <span>Gerenciador de Portfólio</span>
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
                  {galleryList.length} / {galleryPhotosLimit < 0 ? 'Ilimitadas' : galleryPhotosLimit} Fotos
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
                  <label className="block font-semibold text-[#5A4035] mb-1">Enviar imagem ou informar URL:</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setNewPhotoFile(event.target.files?.[0] || null)}
                    className="w-full p-2 bg-white border border-[#5A4035]/20 rounded-xl text-[11px]"
                  />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="w-full mt-2 p-2.5 bg-white border border-[#5A4035]/20 rounded-xl"
                  />
                  <p className="mt-1 text-[10px] text-[#5A4035]/65">JPG, PNG ou WebP, até 5 MB. O arquivo enviado tem prioridade sobre a URL.</p>
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
                    disabled={uploadingGalleryPhoto || (galleryPhotosLimit >= 0 && galleryList.length >= galleryPhotosLimit)}
                    className="px-5 py-2.5 bg-[#5A4035] text-white font-bold rounded-xl hover:bg-[#432e26] transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-[#C7A86A]" />
                    <span>{uploadingGalleryPhoto ? 'Enviando...' : 'Adicionar Foto'}</span>
                  </button>
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

            <div className="pt-4 border-t border-[#C88E9B]/20 text-right text-xs text-[#5A4035]/65">
              Fotos adicionadas, removidas, destacadas ou reordenadas são salvas automaticamente.
            </div>
          </div>

        </div>
      )}

      {/* Tab Content: Minha Assinatura */}
      {activeTab === 'subscription' && (
        <PhotographerSubscriptionTab
          photographer={photographer}
          onUpdatePhotographer={onUpdatePhotographer}
        />
      )}

    </div>
  );
};
