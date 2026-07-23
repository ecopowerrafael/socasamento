import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { PhotographerCard } from './components/PhotographerCard';
import { SearchDirectoryView } from './components/SearchDirectoryView';
import { PhotographerProfileView } from './components/PhotographerProfileView';
import { CitySEOView } from './components/CitySEOView';
import { ComparePhotographersView } from './components/ComparePhotographersView';
import { RecentWeddingsFeed } from './components/RecentWeddingsFeed';
import { ToolsCoupleView } from './components/ToolsCoupleView';
import { BlogView } from './components/BlogView';
import { PlansMonetizationView } from './components/PlansMonetizationView';
import { PhotographerPanel } from './components/PhotographerPanel';
import { AdminDashboard } from './components/AdminDashboard';
import { BrazilMapStateBrowser } from './components/BrazilMapStateBrowser';
import { MultiQuoteModal } from './components/MultiQuoteModal';
import { Footer } from './components/Footer';

import { MOCK_PHOTOGRAPHERS, RECENT_WEDDINGS, CITY_SEO_PAGES } from './data/mockData';
import { Photographer, CategoryType, PricingPackage } from './types';
import { Star, ShieldCheck, Camera, Sparkles, Heart, Quote } from 'lucide-react';

export default function App() {
  // Navigation View state
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'Todos'>('Todos');
  const [selectedPhotographerSlug, setSelectedPhotographerSlug] = useState<string>('');
  
  // App State Data
  const [photographersList, setPhotographersList] = useState<Photographer[]>(MOCK_PHOTOGRAPHERS);
  const [favorites, setFavorites] = useState<string[]>(['p1', 'p2']);
  const [comparedIds, setComparedIds] = useState<string[]>(['p1', 'p2']);

  // Multi Quote Modal state
  const [isMultiQuoteOpen, setIsMultiQuoteOpen] = useState<boolean>(false);
  const [quotePhotographers, setQuotePhotographers] = useState<Photographer[]>([]);
  const [specificPackageSelected, setSpecificPackageSelected] = useState<PricingPackage | undefined>(undefined);

  // Toggle Favorite
  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Toggle Compare
  const toggleCompare = (id: string) => {
    setComparedIds((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= 4) {
        alert('Você pode comparar até 4 fotógrafos simultaneamente.');
        return prev;
      }
      return [...prev, id];
    });
  };

  // Single or Multi Quote Trigger
  const handleOpenQuoteModal = (photographer?: Photographer, pkg?: PricingPackage) => {
    if (photographer) {
      setQuotePhotographers([photographer]);
      setSpecificPackageSelected(pkg);
    } else if (comparedIds.length > 0) {
      const selected = photographersList.filter((p) => comparedIds.includes(p.id));
      setQuotePhotographers(selected);
      setSpecificPackageSelected(undefined);
    } else {
      setQuotePhotographers(photographersList.slice(0, 3));
      setSpecificPackageSelected(undefined);
    }
    setIsMultiQuoteOpen(true);
  };

  // View Profile Handler
  const handleViewProfile = (slug: string) => {
    setSelectedPhotographerSlug(slug);
    setCurrentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // City Search Handler
  const handleSearchCitySubmit = (city: string) => {
    setSelectedCity(city);
    
    // Check if city matches SEO page
    const seoPage = CITY_SEO_PAGES.find((p) => p.city.toLowerCase() === city.toLowerCase());
    if (seoPage) {
      setCurrentView(`city-${seoPage.city.toLowerCase()}`);
    } else {
      setCurrentView('directory');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Badge Toggle Handler
  const handleToggleBadge = (photographerId: string, badge: 'Verificado' | 'Top Avaliado' | 'Premium') => {
    setPhotographersList((prev) =>
      prev.map((p) => {
        if (p.id === photographerId) {
          const hasBadge = p.badges.includes(badge);
          const updatedBadges = hasBadge
            ? p.badges.filter((b) => b !== badge)
            : [...p.badges, badge];
          return { ...p, badges: updatedBadges };
        }
        return p;
      })
    );
  };

  // Update Photographer Handler
  const handleUpdatePhotographer = (updated: Photographer) => {
    setPhotographersList((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  // Active photographer for profile view
  const activePhotographer = photographersList.find((p) => p.slug === selectedPhotographerSlug) || photographersList[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6EEE8] text-[#5A4035] selection:bg-[#C88E9B] selection:text-white">
      
      {/* Header */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favorites.length}
        compareCount={comparedIds.length}
        openMultiQuote={() => handleOpenQuoteModal()}
        selectedCity={selectedCity}
      />

      {/* Main View Router */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <div className="space-y-12">
            
            {/* Hero Search */}
            <HeroSearch
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedCategory={selectedCategory}
              setSelectedCategory={(cat) => {
                setSelectedCategory(cat);
                if (cat !== 'Todos') setCurrentView('directory');
              }}
              onSearchSubmit={handleSearchCitySubmit}
              photographerCount={photographersList.length}
            />

            {/* Featured Photographers */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C88E9B]/20 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#C88E9B]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C7A86A]" />
                    <span>Seleção Especial</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A4035]">
                    Fotógrafos em Destaque no Brasil
                  </h2>
                </div>

                <button
                  onClick={() => setCurrentView('directory')}
                  className="text-xs font-bold text-[#C88E9B] hover:underline"
                >
                  Ver Todos os Fotógrafos →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {photographersList.filter((p) => p.featuredInHome).map((p) => (
                  <PhotographerCard
                    key={p.id}
                    photographer={p}
                    onViewProfile={handleViewProfile}
                    onOpenQuote={handleOpenQuoteModal}
                    isFavorite={favorites.includes(p.id)}
                    onToggleFavorite={toggleFavorite}
                    isCompared={comparedIds.includes(p.id)}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            </section>

            {/* Brazil Map & State Explorer */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <BrazilMapStateBrowser
                onSelectCity={(city) => handleSearchCitySubmit(city)}
              />
            </section>

            {/* Recent Weddings Preview */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C88E9B]/20 pb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A4035]">
                    Últimos Casamentos Publicados
                  </h2>
                  <p className="text-xs text-[#5A4035]/70">Histórias reais e inspiradoras com fotógrafos do portal</p>
                </div>

                <button
                  onClick={() => setCurrentView('weddings')}
                  className="text-xs font-bold text-[#C88E9B] hover:underline"
                >
                  Ver Feed Completo →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {RECENT_WEDDINGS.slice(0, 4).map((w) => (
                  <div
                    key={w.id}
                    onClick={() => handleViewProfile(w.photographerSlug)}
                    className="bg-white rounded-2xl overflow-hidden border border-[#C88E9B]/20 shadow-xs hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="h-40 overflow-hidden relative">
                      <img src={w.coverImage} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-2 left-2 bg-[#5A4035] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {w.city}
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="font-serif font-bold text-xs text-[#5A4035] line-clamp-1">{w.couple}</h4>
                      <p className="text-[11px] text-[#5A4035]/70 truncate">{w.venue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Testimonials section */}
            <section className="bg-white py-12 border-y border-[#C88E9B]/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C88E9B]">Depoimentos Reais</span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A4035] mt-1">
                    O que as noivas dizem sobre o Só Fotógrafos
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="bg-[#FAF5F0] p-6 rounded-2xl border border-[#C88E9B]/20 space-y-3">
                    <Quote className="w-6 h-6 text-[#C88E9B]" />
                    <p className="text-xs text-[#5A4035] italic leading-relaxed">
                      "Achei o Eduardo Perez de Piracicaba em 5 minutos! Comparei os pacotes com outros 3 fotógrafos e recebi a proposta direto no WhatsApp. A melhor plataforma do Brasil!"
                    </p>
                    <div className="pt-2 border-t border-[#5A4035]/10">
                      <span className="font-bold text-xs text-[#5A4035] block">Mariana & Lucas</span>
                      <span className="text-[10px] text-[#5A4035]/60">Casamento em Piracicaba - SP</span>
                    </div>
                  </div>

                  <div className="bg-[#FAF5F0] p-6 rounded-2xl border border-[#C88E9B]/20 space-y-3">
                    <Quote className="w-6 h-6 text-[#C88E9B]" />
                    <p className="text-xs text-[#5A4035] italic leading-relaxed">
                      "A cotação múltipla facilitou demais minha vida de noiva atarefada. Em um só clique enviei meu orçamento para os melhores estúdios de São Paulo."
                    </p>
                    <div className="pt-2 border-t border-[#5A4035]/10">
                      <span className="font-bold text-xs text-[#5A4035] block">Beatriz & Lucas</span>
                      <span className="text-[10px] text-[#5A4035]/60">Casamento nos Jardins - SP</span>
                    </div>
                  </div>

                  <div className="bg-[#FAF5F0] p-6 rounded-2xl border border-[#C88E9B]/20 space-y-3">
                    <Quote className="w-6 h-6 text-[#C88E9B]" />
                    <p className="text-xs text-[#5A4035] italic leading-relaxed">
                      "A calculadora de custos e o checklist de fotografia me ajudaram a não estourar o orçamento do meu mini wedding no Paraná!"
                    </p>
                    <div className="pt-2 border-t border-[#5A4035]/10">
                      <span className="font-bold text-xs text-[#5A4035] block">Patricia & Gabriel</span>
                      <span className="text-[10px] text-[#5A4035]/60">Casamento em Curitiba - PR</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Register Studio */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <div className="bg-[#5A4035] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-[#C7A86A]">
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs font-bold text-[#C7A86A] uppercase tracking-wider">É Fotógrafo de Casamento?</span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold">Cadastre seu Estúdio no Maior Portal do País</h2>
                  <p className="text-xs sm:text-sm text-white/80 max-w-xl">
                    Receba pedidos de orçamento diretamente no seu WhatsApp e alcance noivos da sua cidade.
                  </p>
                </div>

                <button
                  onClick={() => setCurrentView('plans')}
                  className="px-8 py-3.5 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold text-xs rounded-xl shadow-lg transition-all shrink-0"
                >
                  Cadastrar Meu Estúdio Grátis
                </button>
              </div>
            </section>

          </div>
        )}

        {/* VIEW 2: DIRECTORY & SEARCH */}
        {currentView === 'directory' && (
          <SearchDirectoryView
            photographers={photographersList}
            initialCity={selectedCity}
            onViewProfile={handleViewProfile}
            onOpenQuote={handleOpenQuoteModal}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            comparedIds={comparedIds}
            onToggleCompare={toggleCompare}
            openMultiQuote={() => handleOpenQuoteModal()}
          />
        )}

        {/* VIEW 3: PROFILE VIEW */}
        {currentView === 'profile' && (
          <PhotographerProfileView
            photographer={activePhotographer}
            onOpenQuote={handleOpenQuoteModal}
            onBack={() => setCurrentView('directory')}
            isFavorite={favorites.includes(activePhotographer.id)}
            onToggleFavorite={toggleFavorite}
            isCompared={comparedIds.includes(activePhotographer.id)}
            onToggleCompare={toggleCompare}
          />
        )}

        {/* VIEW 4: CITY SEO VIEWS */}
        {currentView.startsWith('city-') && (
          <CitySEOView
            cityData={
              CITY_SEO_PAGES.find((p) => `city-${p.city.toLowerCase()}` === currentView) ||
              CITY_SEO_PAGES[0]
            }
            photographers={photographersList}
            recentWeddings={RECENT_WEDDINGS}
            onViewProfile={handleViewProfile}
            onOpenQuote={handleOpenQuoteModal}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            comparedIds={comparedIds}
            onToggleCompare={toggleCompare}
            openMultiQuote={() => handleOpenQuoteModal()}
          />
        )}

        {/* VIEW 5: COMPARE PHOTOGRAPHERS */}
        {currentView === 'compare' && (
          <ComparePhotographersView
            photographers={photographersList}
            comparedIds={comparedIds}
            onRemoveCompare={toggleCompare}
            onClearAllCompare={() => setComparedIds([])}
            onViewProfile={handleViewProfile}
            onOpenQuote={handleOpenQuoteModal}
            openMultiQuote={() => handleOpenQuoteModal()}
            onBackToDirectory={() => setCurrentView('directory')}
          />
        )}

        {/* VIEW 6: RECENT WEDDINGS FEED */}
        {currentView === 'weddings' && (
          <RecentWeddingsFeed
            weddings={RECENT_WEDDINGS}
            onViewPhotographerProfile={handleViewProfile}
            openMultiQuote={() => handleOpenQuoteModal()}
          />
        )}

        {/* VIEW 7: TOOLS FOR COUPLES */}
        {currentView === 'tools' && (
          <ToolsCoupleView openMultiQuote={() => handleOpenQuoteModal()} />
        )}

        {/* VIEW 8: BLOG SEO */}
        {currentView === 'blog' && (
          <BlogView openMultiQuote={() => handleOpenQuoteModal()} />
        )}

        {/* VIEW 9: PLANS & MONETIZATION */}
        {currentView === 'plans' && (
          <PlansMonetizationView openMultiQuote={() => handleOpenQuoteModal()} />
        )}

        {/* VIEW 10: PHOTOGRAPHER PANEL (CRM) */}
        {currentView === 'photographer-panel' && (
          <PhotographerPanel
            photographer={photographersList[0]}
            onUpdatePhotographer={handleUpdatePhotographer}
          />
        )}

        {/* VIEW 11: ADMIN PANEL */}
        {currentView === 'admin-panel' && (
          <AdminDashboard
            photographers={photographersList}
            onToggleBadge={handleToggleBadge}
            onUpdatePhotographer={handleUpdatePhotographer}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        setCurrentView={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCity={handleSearchCitySubmit}
      />

      {/* Global Multi Quote Lead Modal */}
      <MultiQuoteModal
        isOpen={isMultiQuoteOpen}
        onClose={() => setIsMultiQuoteOpen(false)}
        selectedPhotographers={quotePhotographers}
        specificPackage={specificPackageSelected}
      />

    </div>
  );
}
