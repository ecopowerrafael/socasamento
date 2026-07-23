import React from 'react';
import { Star, ShieldCheck, MapPin, Award, Check, Sparkles, Eye, Scale, Heart, MessageSquare } from 'lucide-react';
import { Photographer } from '../types';

interface PhotographerCardProps {
  photographer: Photographer;
  onViewProfile: (slug: string) => void;
  onOpenQuote: (photographer: Photographer) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
}

export const PhotographerCard: React.FC<PhotographerCardProps> = ({
  photographer,
  onViewProfile,
  onOpenQuote,
  isFavorite,
  onToggleFavorite,
  isCompared,
  onToggleCompare,
}) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#C88E9B]/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative">
      
      {/* Cover Image Header with Badges */}
      <div className="relative h-52 overflow-hidden bg-slate-900">
        <img
          src={photographer.coverImage}
          alt={photographer.studioName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Top Action Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex flex-wrap gap-1">
            {photographer.badges.includes('Verificado') && (
              <span className="bg-[#5A4035] text-[#C7A86A] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md border border-[#C7A86A]/40">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C7A86A]" />
                <span>Selo Verificado</span>
              </span>
            )}
            {photographer.plan === 'Premium' && (
              <span className="bg-[#C7A86A] text-[#5A4035] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Premium
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Compare Checkbox Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(photographer.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all text-xs font-semibold flex items-center gap-1 ${
                isCompared
                  ? 'bg-[#C7A86A] text-[#5A4035]'
                  : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
              title="Adicionar para comparar até 4 fotógrafos lado a lado"
            >
              <Scale className="w-4 h-4" />
              <span className="hidden sm:inline">{isCompared ? 'Comparando' : '+ Comparar'}</span>
            </button>

            {/* Favorite Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(photographer.id);
              }}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all"
              aria-label="Salvar nos favoritos"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#C88E9B] text-[#C88E9B]' : 'text-white'}`} />
            </button>
          </div>
        </div>

        {/* Bottom Avatar & Studio Name */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3 z-10">
          <img
            src={photographer.avatar}
            alt={photographer.name}
            className="w-14 h-14 rounded-full border-2 border-white object-cover shadow-lg shrink-0"
          />
          <div className="text-white min-w-0">
            <h3 className="text-lg font-serif font-bold text-white leading-tight truncate drop-shadow-xs">
              {photographer.studioName}
            </h3>
            <p className="text-xs text-white/80 font-medium truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#C88E9B] inline" />
              <span>{photographer.city}, {photographer.state}</span>
              {photographer.neighborhood && <span>• {photographer.neighborhood}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Rating and Price Row */}
        <div className="flex items-center justify-between pt-1 text-xs">
          {/* Star Rating */}
          <div className="flex items-center gap-1 bg-[#FAF5F0] px-2.5 py-1 rounded-lg border border-[#C88E9B]/20">
            <Star className="w-3.5 h-3.5 fill-[#C7A86A] text-[#C7A86A]" />
            <span className="font-bold text-[#5A4035]">{photographer.rating.toFixed(1)}</span>
            <span className="text-[#5A4035]/60">({photographer.reviewCount} avaliações)</span>
          </div>

          {/* Starting Price */}
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#5A4035]/60 block leading-none">A partir de</span>
            <span className="text-sm font-bold text-[#5A4035] font-serif">
              R$ {photographer.priceStartingFrom.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Bio Excerpt */}
        <p className="text-xs text-[#5A4035]/80 line-clamp-2 leading-relaxed">
          {photographer.description}
        </p>

        {/* Style & Deliverable Tags */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1">
            {photographer.styles.slice(0, 3).map((style) => (
              <span
                key={style}
                className="bg-[#F6EEE8] text-[#5A4035] text-[11px] font-semibold px-2 py-0.5 rounded-md border border-[#C88E9B]/20"
              >
                {style}
              </span>
            ))}
            {photographer.styles.length > 3 && (
              <span className="text-[10px] text-[#5A4035]/60 font-semibold px-1 py-0.5">
                +{photographer.styles.length - 3}
              </span>
            )}
          </div>

          {/* Deliverables icons summary */}
          <div className="flex items-center gap-2 text-[11px] text-[#5A4035]/70 pt-1 border-t border-[#5A4035]/10">
            <span className="font-semibold text-[#5A4035]">Entregáveis:</span>
            <span className="truncate">{photographer.deliverables.slice(0, 4).join(' • ')}</span>
          </div>
        </div>

        {/* Stats metrics */}
        <div className="grid grid-cols-2 gap-2 text-center text-[11px] bg-[#FAF5F0] p-2 rounded-xl border border-[#5A4035]/10">
          <div>
            <span className="font-bold text-[#5A4035] block">{photographer.yearsExperience} Anos</span>
            <span className="text-[#5A4035]/60 text-[10px]">de Experiência</span>
          </div>
          <div>
            <span className="font-bold text-[#5A4035] block">{photographer.weddingsCompleted}+</span>
            <span className="text-[#5A4035]/60 text-[10px]">Casamentos</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewProfile(photographer.slug)}
            className="w-full py-2.5 px-3 bg-[#FAF5F0] hover:bg-[#F6EEE8] text-[#5A4035] font-semibold text-xs rounded-xl border border-[#C88E9B]/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-[#C88E9B]" />
            <span>Ver Perfil</span>
          </button>

          <button
            onClick={() => onOpenQuote(photographer)}
            className="w-full py-2.5 px-3 bg-[#C88E9B] hover:bg-[#b07885] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#C7A86A]" />
            <span>Orçamento</span>
          </button>
        </div>

      </div>
    </div>
  );
};
