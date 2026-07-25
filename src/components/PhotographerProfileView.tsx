import React, { useState } from 'react';
import { 
  Star, ShieldCheck, MapPin, Award, Check, Sparkles, Phone, MessageSquare, 
  Instagram, Globe, Mail, Calendar, Camera, Film, Compass, ChevronDown, 
  ChevronUp, X, Heart, Scale, Share2, DollarSign, Users, Info
} from 'lucide-react';
import { Photographer, PricingPackage, Review, PhotoItem } from '../types';

interface PhotographerProfileViewProps {
  photographer: Photographer;
  onOpenQuote: (photographer: Photographer, packageSelected?: PricingPackage) => void;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
}

export const PhotographerProfileView: React.FC<PhotographerProfileViewProps> = ({
  photographer,
  onOpenQuote,
  onBack,
  isFavorite,
  onToggleFavorite,
  isCompared,
  onToggleCompare,
}) => {
  const [activeGalleryTab, setActiveGalleryTab] = useState<string>('Todas');
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedShare, setCopiedShare] = useState(false);

  // Review submission state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    coupleName: '',
    weddingLocation: '',
    rating: 5,
    comment: ''
  });
  const [reviewsList, setReviewsList] = useState<Review[]>(photographer.reviews || []);

  const galleryCategories = ['Todas', 'Pré Wedding', 'Making Of', 'Cerimônia', 'Festa', 'Drone', 'Álbuns'];

  const filteredGallery = activeGalleryTab === 'Todas'
    ? photographer.gallery
    : photographer.gallery.filter(p => p.category === activeGalleryTab);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.coupleName || !newReview.comment) return;

    const created: Review = {
      id: `rev-${Date.now()}`,
      coupleName: newReview.coupleName,
      date: 'Hoje',
      weddingLocation: newReview.weddingLocation || photographer.city,
      rating: newReview.rating,
      comment: newReview.comment,
      verifiedBooking: true
    };

    setReviewsList([created, ...reviewsList]);
    setShowReviewModal(false);
    setNewReview({ coupleName: '', weddingLocation: '', rating: 5, comment: '' });
  };

  return (
    <div className="bg-[#FAF5F0] min-h-screen pb-16">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="bg-white border-b border-[#C88E9B]/20 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[#5A4035]">
          <button
            onClick={onBack}
            className="font-semibold text-[#C88E9B] hover:underline flex items-center gap-1"
          >
            ← Voltar para a busca
          </button>
          <span className="text-[#5A4035]/60 truncate">
            Início / Fotógrafos / {photographer.city} / <strong className="text-[#5A4035]">{photographer.studioName}</strong>
          </span>
        </div>
      </div>

      {/* Hero Cover Banner */}
      <div className="relative h-72 sm:h-96 w-full bg-slate-900 overflow-hidden">
        <img
          src={photographer.coverImage}
          alt={photographer.studioName}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        {/* Quick Share / Favorite Floating Buttons */}
        <div className="absolute top-4 right-4 sm:right-8 flex items-center gap-2 z-10">
          <button
            onClick={handleShare}
            className="bg-white/90 hover:bg-white text-[#5A4035] px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md shadow-md flex items-center gap-1.5 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedShare ? 'Link Copiado!' : 'Compartilhar'}</span>
          </button>

          <button
            onClick={() => onToggleFavorite(photographer.id)}
            className="bg-white/90 hover:bg-white text-[#5A4035] p-2 rounded-xl backdrop-blur-md shadow-md transition-all"
            aria-label="Salvar nos Favoritos"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#C88E9B] text-[#C88E9B]' : 'text-[#5A4035]'}`} />
          </button>

          <button
            onClick={() => onToggleCompare(photographer.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md shadow-md flex items-center gap-1.5 transition-all ${
              isCompared ? 'bg-[#C7A86A] text-[#5A4035]' : 'bg-white/90 text-[#5A4035]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isCompared ? 'Comparando' : 'Comparar'}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 space-y-8">
        
        {/* Header Profile Info Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#C88E9B]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
            <img
              src={photographer.avatar}
              alt={photographer.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-xl object-cover"
            />
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A4035]">
                  {photographer.studioName}
                </h1>
                {photographer.badges.includes('Verificado') && (
                  <span className="bg-[#5A4035] text-[#C7A86A] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-[#C7A86A]/40">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C7A86A]" />
                    <span>Selo Verificado</span>
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-[#5A4035]/80 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C88E9B]" />
                <span>{photographer.city}, {photographer.state}</span>
                {photographer.neighborhood && <span>({photographer.neighborhood})</span>}
                <span className="text-[#C88E9B]">• Atende Brasil inteiro</span>
              </p>

              <div className="flex items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1 font-bold text-[#5A4035] bg-[#FAF5F0] px-2.5 py-1 rounded-lg border border-[#C88E9B]/20">
                  <Star className="w-4 h-4 fill-[#C7A86A] text-[#C7A86A]" />
                  <span>{photographer.rating.toFixed(1)}</span>
                  <span className="text-[#5A4035]/60">({reviewsList.length} avaliações)</span>
                </div>

                <div className="text-[#5A4035]/80 font-semibold">
                  <Award className="w-4 h-4 text-[#C7A86A] inline mr-1" />
                  <span>{photographer.awardsCount} Prêmios Nacionais</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact CTAs */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-[#5A4035]/10">
            <a
              href={`https://wa.me/${photographer.whatsapp}?text=Ol%C3%A1!%20Encontrei%20seu%20perfil%20no%20portal%20S%C3%B3%20Fot%C3%B3grafos%20de%20Casamento%20e%20gostaria%20de%20um%20or%C3%A7amento.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>WhatsApp Direto</span>
            </a>

            <button
              onClick={() => onOpenQuote(photographer)}
              className="px-6 py-3 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#C7A86A]" />
              <span>Solicitar Orçamento</span>
            </button>
          </div>

        </div>

        {/* 2-Column Grid: Left Content Main, Right Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Left Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Presentation Bio & Badges */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#C88E9B]/20 space-y-6">
              <h2 className="text-xl font-serif font-bold text-[#5A4035] flex items-center gap-2 border-b border-[#C88E9B]/20 pb-3">
                <Info className="w-5 h-5 text-[#C88E9B]" />
                <span>Apresentação do Estúdio</span>
              </h2>

              <p className="text-sm text-[#5A4035]/90 leading-relaxed font-normal whitespace-pre-line">
                {photographer.bioFull}
              </p>

              {/* Key Metrics Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-[#FAF5F0] p-4 rounded-2xl border border-[#C88E9B]/20 text-center">
                  <span className="text-2xl font-serif font-bold text-[#5A4035] block">{photographer.yearsExperience} Anos</span>
                  <span className="text-xs text-[#5A4035]/70 font-semibold">de Experiência</span>
                </div>
                <div className="bg-[#FAF5F0] p-4 rounded-2xl border border-[#C88E9B]/20 text-center">
                  <span className="text-2xl font-serif font-bold text-[#5A4035] block">{photographer.weddingsCompleted}+</span>
                  <span className="text-xs text-[#5A4035]/70 font-semibold">Casamentos Cobertos</span>
                </div>
                <div className="bg-[#FAF5F0] p-4 rounded-2xl border border-[#C88E9B]/20 text-center">
                  <span className="text-2xl font-serif font-bold text-[#5A4035] block">{photographer.awardsCount}</span>
                  <span className="text-xs text-[#5A4035]/70 font-semibold">Prêmios de Fotografia</span>
                </div>
                <div className="bg-[#FAF5F0] p-4 rounded-2xl border border-[#C88E9B]/20 text-center">
                  <span className="text-2xl font-serif font-bold text-[#5A4035] block">{reviewsList.length}</span>
                  <span className="text-xs text-[#5A4035]/70 font-semibold">Depoimentos Reais</span>
                </div>
              </div>

              {/* Styles & Deliverables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#5A4035]/10 text-xs">
                <div>
                  <span className="font-bold text-[#5A4035] uppercase block mb-2">Estilos Fotográficos:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {photographer.styles.map(s => (
                      <span key={s} className="bg-[#F6EEE8] text-[#5A4035] px-3 py-1 rounded-lg border border-[#C88E9B]/30 font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-[#5A4035] uppercase block mb-2">Entregáveis Inclusos:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {photographer.deliverables.map(d => (
                      <span key={d} className="bg-[#5A4035] text-white px-3 py-1 rounded-lg font-semibold">
                        ✓ {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Gallery Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#C88E9B]/20 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C88E9B]/20 pb-3">
                <h2 className="text-xl font-serif font-bold text-[#5A4035] flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#C88E9B]" />
                  <span>Galeria de Fotos do Estúdio</span>
                </h2>
                <span className="text-xs text-[#5A4035]/70">{photographer.gallery.length} Fotos Sem Limites</span>
              </div>

              {/* Gallery Filter Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {galleryCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveGalleryTab(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      activeGalleryTab === cat
                        ? 'bg-[#C88E9B] text-white shadow-xs'
                        : 'bg-[#FAF5F0] text-[#5A4035] hover:bg-[#F6EEE8]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Gallery Masonry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredGallery.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setLightboxPhoto(photo)}
                    className="relative h-44 sm:h-52 rounded-2xl overflow-hidden cursor-pointer group bg-slate-100 border border-[#C88E9B]/10"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white text-xs font-medium">
                      <span>{photo.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Packages Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#C88E9B]/20 space-y-6">
              <h2 className="text-xl font-serif font-bold text-[#5A4035] flex items-center gap-2 border-b border-[#C88E9B]/20 pb-3">
                <DollarSign className="w-5 h-5 text-[#C7A86A]" />
                <span>Pacotes & Tabelas de Investimento</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {photographer.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`rounded-2xl p-6 border flex flex-col justify-between relative transition-all ${
                      pkg.popular
                        ? 'bg-[#FAF5F0] border-2 border-[#C88E9B] shadow-lg scale-102'
                        : 'bg-white border-[#5A4035]/15'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C88E9B] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                        Mais Escolhido
                      </span>
                    )}

                    <div>
                      <h3 className="text-lg font-serif font-bold text-[#5A4035] mb-1">{pkg.name}</h3>
                      <p className="text-xs text-[#5A4035]/70 mb-4">{pkg.description}</p>
                      
                      <div className="mb-6">
                        <span className="text-3xl font-serif font-bold text-[#5A4035]">
                          R$ {pkg.price.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-xs text-[#5A4035]/60 block">Em até 10x no cartão ou com desconto no PIX</span>
                      </div>

                      <ul className="space-y-2 text-xs text-[#5A4035] mb-6">
                        {pkg.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#C88E9B] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => onOpenQuote(photographer, pkg)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                        pkg.popular
                          ? 'bg-[#C88E9B] hover:bg-[#b07885] text-white shadow-md'
                          : 'bg-[#5A4035] hover:bg-[#C88E9B] text-white'
                      }`}
                    >
                      Escolher este Pacote
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#C88E9B]/20 space-y-6">
              <div className="flex items-center justify-between border-b border-[#C88E9B]/20 pb-3">
                <h2 className="text-xl font-serif font-bold text-[#5A4035] flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#C7A86A] fill-[#C7A86A]" />
                  <span>Avaliações de Noivos Reais ({reviewsList.length})</span>
                </h2>

                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-[#FAF5F0] hover:bg-[#F6EEE8] text-[#5A4035] font-semibold text-xs rounded-xl border border-[#C88E9B]/30"
                >
                  + Deixar Avaliação
                </button>
              </div>

              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="bg-[#FAF5F0] p-5 rounded-2xl border border-[#C88E9B]/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#5A4035]">{rev.coupleName}</h4>
                        <p className="text-xs text-[#5A4035]/60">{rev.weddingLocation} • {rev.date}</p>
                      </div>

                      <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#C88E9B]/20 text-xs font-bold text-[#5A4035]">
                        <Star className="w-3.5 h-3.5 fill-[#C7A86A] text-[#C7A86A]" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#5A4035]/90 italic leading-relaxed">
                      "{rev.comment}"
                    </p>

                    {rev.photographerReply && (
                      <div className="bg-white p-3 rounded-xl text-xs text-[#5A4035] border-l-4 border-[#C88E9B] space-y-1">
                        <span className="font-bold text-[#5A4035]">Resposta do Estúdio:</span>
                        <p className="text-[#5A4035]/80">{rev.photographerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            {photographer.faqs && photographer.faqs.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#C88E9B]/20 space-y-4">
                <h2 className="text-xl font-serif font-bold text-[#5A4035] border-b border-[#C88E9B]/20 pb-3">
                  Perguntas Frequentes (FAQ)
                </h2>

                <div className="space-y-3">
                  {photographer.faqs.map((faq, idx) => (
                    <div key={idx} className="border border-[#5A4035]/15 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        className="w-full p-4 text-left font-bold text-sm text-[#5A4035] bg-[#FAF5F0] flex items-center justify-between"
                      >
                        <span>{faq.question}</span>
                        {openFaqIndex === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {openFaqIndex === idx && (
                        <div className="p-4 bg-white text-xs text-[#5A4035]/80 border-t border-[#5A4035]/10 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sticky Right Sidebar Contact & Direct Quote Box */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#C88E9B]/30 sticky top-24 space-y-6">
              
              <div>
                <span className="text-xs font-bold text-[#5A4035]/60 uppercase tracking-wider block">Orçamento a partir de</span>
                <span className="text-3xl font-serif font-bold text-[#5A4035]">
                  R$ {photographer.priceStartingFrom.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs text-[#5A4035]/70 block mt-1">Garantia e Moderação do Portal</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => onOpenQuote(photographer)}
                  className="w-full py-3.5 bg-gradient-to-r from-[#C88E9B] to-[#b07885] hover:from-[#b07885] hover:to-[#5A4035] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#C7A86A]" />
                  <span>Solicitar Orçamento Online</span>
                </button>

                <a
                  href={`https://wa.me/${photographer.whatsapp}?text=Ol%C3%A1!%20Gostaria%20de%20consultar%20a%20disponibilidade%20para%20meu%20casamento.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Chamar no WhatsApp</span>
                </a>
              </div>

              {/* Direct Info List */}
              <div className="pt-4 border-t border-[#5A4035]/10 space-y-3 text-xs text-[#5A4035]">
                <div className="flex items-center gap-2 font-medium">
                  <Phone className="w-4 h-4 text-[#C88E9B]" />
                  <span>{photographer.phone}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Instagram className="w-4 h-4 text-[#C88E9B]" />
                  <span>{photographer.instagram}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Mail className="w-4 h-4 text-[#C88E9B]" />
                  <span className="truncate">{photographer.email}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Globe className="w-4 h-4 text-[#C88E9B]" />
                  <span className="truncate">{photographer.website}</span>
                </div>
              </div>

              {/* Security guarantee */}
              <div className="bg-[#FAF5F0] p-4 rounded-2xl border border-[#C7A86A]/40 text-[11px] text-[#5A4035] space-y-1">
                <span className="font-bold text-[#5A4035] flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#C7A86A]" />
                  <span>Segurança Guia Fotógrafo Casamento:</span>
                </span>
                <p className="text-[#5A4035]/80">
                  Estúdio auditado e certificado pelo portal com contrato padrão de prestação de serviços.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 text-white p-3 hover:bg-white/20 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] text-center space-y-3">
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.caption}
              className="max-h-[75vh] mx-auto rounded-2xl shadow-2xl object-contain"
            />
            <p className="text-white text-sm font-semibold">{lightboxPhoto.caption}</p>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-[#5A4035]/60 hover:text-[#5A4035]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-[#5A4035]">
              Deixar Avaliação para {photographer.studioName}
            </h3>

            <form onSubmit={handleAddReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Nome do Casal:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda & Pedro"
                  value={newReview.coupleName}
                  onChange={(e) => setNewReview({ ...newReview, coupleName: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Local do Casamento:</label>
                <input
                  type="text"
                  placeholder="Ex: Espaço Terras de Clara - Piracicaba"
                  value={newReview.weddingLocation}
                  onChange={(e) => setNewReview({ ...newReview, weddingLocation: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Nota (1 a 5 estrelas):</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl font-bold"
                >
                  <option value={5}>★★★★★ (5.0) Excelente</option>
                  <option value={4}>★★★★☆ (4.0) Muito Bom</option>
                  <option value={3}>★★★☆☆ (3.0) Satisfatório</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Seu Depoimento:</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Conte como foi a experiência com a equipe no dia do casamento..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#C88E9B] text-white font-bold rounded-xl hover:bg-[#b07885]"
              >
                Publicar Avaliação
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
