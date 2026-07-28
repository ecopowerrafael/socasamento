import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { PhotographerCard } from './components/PhotographerCard';
import { SearchDirectoryView } from './components/SearchDirectoryView';
import { PhotographerProfileView } from './components/PhotographerProfileView';
import { ComparePhotographersView } from './components/ComparePhotographersView';
import { RecentWeddingsFeed } from './components/RecentWeddingsFeed';
import { ToolsCoupleView } from './components/ToolsCoupleView';
import { BlogView } from './components/BlogView';
import { PlansMonetizationView } from './components/PlansMonetizationView';
import { PhotographerPanel } from './components/PhotographerPanel';
import { AdminDashboard } from './components/AdminDashboard';
import { BrazilMapStateBrowser } from './components/BrazilMapStateBrowser';
import { MultiQuoteModal } from './components/MultiQuoteModal';
import { AuthView } from './components/AuthView';
import { BrideSignupView } from './components/BrideSignupView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { Footer } from './components/Footer';
import { NotificationsView } from './components/NotificationsView';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

import { Photographer, CategoryType, PricingPackage, UserSession } from './types';
import { Sparkles, Quote, RefreshCw } from 'lucide-react';

export default function App() {
  // Helper to parse route from location
  const getRouteFromUrl = () => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    const hash = window.location.hash.toLowerCase().replace('#', '');
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get('view');

    if (viewParam) {
      if (viewParam === 'admin' || viewParam === 'admin-panel') return { view: 'admin-panel' };
      if (viewParam === 'painel' || viewParam === 'pro' || viewParam === 'photographer-panel') return { view: 'photographer-panel' };
      if (viewParam === 'login') return { view: 'login' };
      if (viewParam === 'register') return { view: 'cadastrar-estudio' };
      if (viewParam === 'blog') return { view: 'blog' };
      if (viewParam === 'plans' || viewParam === 'planos' || viewParam === 'anunciar') return { view: 'plans' };
    }

    if (path === '/login' || hash === 'login') return { view: 'login' };
    if (path === '/cadastro-noiva' || hash === 'cadastro-noiva') return { view: 'cadastro-noiva' };
    if (path === '/cadastrar-estudio' || hash === 'register') return { view: 'cadastrar-estudio' };
    if (path === '/esqueci-minha-senha' || hash === 'forgot') return { view: 'esqueci-minha-senha' };
    if (path === '/redefinir-senha' || hash === 'reset') return { view: 'redefinir-senha' };

    if (path === '/admin' || path.startsWith('/admin/') || hash === 'admin' || hash === 'admin-panel') return { view: 'admin-panel' };
    if (path === '/painel' || path.startsWith('/painel-profissional') || path === '/pro' || path === '/estudio' || hash === 'painel' || hash === 'pro' || hash === 'photographer-panel') return { view: 'photographer-panel' };
    if (path === '/blog' || hash === 'blog') return { view: 'blog' };
    if (path === '/planos' || path === '/anunciar' || hash === 'plans' || hash === 'planos') return { view: 'plans' };
    if (path === '/comparar' || hash === 'compare') return { view: 'compare' };
    if (path === '/casamentos' || hash === 'weddings') return { view: 'weddings' };
    if (path === '/ferramentas' || path === '/portal-do-casal' || hash === 'tools' || hash === 'portal-do-casal') return { view: 'tools' };
    if (path === '/fotografos' || path === '/buscar' || hash === 'directory') return { view: 'directory' };
    if (path === '/notificacoes' || hash === 'notificacoes') return { view: 'notifications' };

    if (path.startsWith('/fotografo/')) {
      const slug = path.replace('/fotografo/', '');
      if (slug) return { view: 'profile', slug };
    }

    return { view: 'home' };
  };

  const initialRoute = getRouteFromUrl();

  // Navigation View state
  const [currentView, setCurrentView] = useState<string>(initialRoute.view || 'home');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'Todos'>('Todos');
  const [selectedPhotographerSlug, setSelectedPhotographerSlug] = useState<string>(initialRoute.slug || '');

  // Auth User Session State
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [photographerProfile, setPhotographerProfile] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // App State Data from Cloud SQL Database
  const [photographersList, setPhotographersList] = useState<Photographer[]>([]);
  const [recentWeddings, setRecentWeddings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  // Multi Quote Modal state
  const [isMultiQuoteOpen, setIsMultiQuoteOpen] = useState<boolean>(false);
  const [quotePhotographers, setQuotePhotographers] = useState<Photographer[]>([]);
  const [specificPackageSelected, setSpecificPackageSelected] = useState<PricingPackage | undefined>(undefined);

  // Check user session on app mount (/api/auth/me)
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        setCheckingAuth(true);
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          setUserSession(data.user);
          if (data.photographerProfile) {
            setPhotographerProfile(data.photographerProfile);
          }
        } else {
          setUserSession(null);
          setPhotographerProfile(null);
        }
      } catch (err) {
        setUserSession(null);
        setPhotographerProfile(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkUserSession();
  }, []);

  // Sync state from location on load & popstate
  useEffect(() => {
    const applyLocationRoute = () => {
      const route = getRouteFromUrl();
      if (route.view) {
        setCurrentView(route.view);
        if (route.slug) setSelectedPhotographerSlug(route.slug);
      }
    };

    window.addEventListener('popstate', applyLocationRoute);
    return () => window.removeEventListener('popstate', applyLocationRoute);
  }, []);

  // Centralized View Navigator
  const navigateToView = (view: string, slug?: string) => {
    setCurrentView(view);
    if (slug) setSelectedPhotographerSlug(slug);

    let path = '/';
    if (view === 'login') path = '/login';
    else if (view === 'cadastro-noiva') path = '/cadastro-noiva';
    else if (view === 'cadastrar-estudio') path = '/cadastrar-estudio';
    else if (view === 'esqueci-minha-senha') path = '/esqueci-minha-senha';
    else if (view === 'redefinir-senha') path = '/redefinir-senha';
    else if (view === 'admin-panel') path = '/admin';
    else if (view === 'photographer-panel') path = '/painel';
    else if (view === 'blog') path = '/blog';
    else if (view === 'plans') path = '/planos';
    else if (view === 'compare') path = '/comparar';
    else if (view === 'weddings') path = '/casamentos';
    else if (view === 'tools') path = '/portal-do-casal';
    else if (view === 'directory') path = '/fotografos';
    else if (view === 'notifications') path = '/notificacoes';
    else if (view === 'profile' && slug) path = `/fotografo/${slug}`;

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login Success Callback
  const handleLoginSuccess = (user: UserSession, pProfile?: any) => {
    setUserSession(user);
    if (pProfile) setPhotographerProfile(pProfile);

    if (user.role === 'admin' || user.role === 'super_admin') {
      navigateToView('admin-panel');
    } else if (user.role === 'photographer') {
      navigateToView('photographer-panel');
    } else if (user.role === 'bride' || user.role === 'client') {
      navigateToView('tools');
    } else {
      navigateToView('home');
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUserSession(null);
      setPhotographerProfile(null);
      navigateToView('login');
    }
  };

  // Fetch photographers from API (Cloud SQL Database)
  const fetchPhotographers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/photographers');
      const data = await res.json();
      if (data.success && Array.isArray(data.photographers)) {
        setPhotographersList(data.photographers);
      }
    } catch (err) {
      console.error('Erro ao carregar fotógrafos do banco:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent weddings from API
  const fetchWeddings = async () => {
    try {
      const res = await fetch('/api/recent-weddings');
      const data = await res.json();
      if (data.success && Array.isArray(data.weddings)) {
        setRecentWeddings(data.weddings);
      }
    } catch (err) {
      console.error('Erro ao carregar casamentos:', err);
    }
  };

  useEffect(() => {
    fetchPhotographers();
    fetchWeddings();
  }, []);

  useEffect(() => {
    if (!userSession) {
      setFavorites([]);
      return;
    }
    fetch('/api/favorites')
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok || body.success === false) throw new Error(body.error || 'Erro ao carregar favoritos.');
        setFavorites((body.favorites || []).map((photographer: any) => String(photographer.id)));
      })
      .catch((error) => console.error('Erro ao carregar favoritos do MySQL:', error));
  }, [userSession]);

  // Toggle Favorite
  const toggleFavorite = async (id: string) => {
    if (!userSession) {
      navigateToView('login');
      return;
    }
    const isFavorite = favorites.includes(id);
    const response = await fetch(isFavorite ? `/api/favorites/${id}` : '/api/favorites', {
      method: isFavorite ? 'DELETE' : 'POST',
      headers: isFavorite ? undefined : { 'Content-Type': 'application/json' },
      body: isFavorite ? undefined : JSON.stringify({ photographerId: id }),
    });
    const body = await response.json();
    if (!response.ok || body.success === false) {
      alert(body.error || 'Não foi possível atualizar o favorito.');
      return;
    }
    setFavorites((previous) =>
      isFavorite ? previous.filter((favoriteId) => favoriteId !== id) : [...previous, id]
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
      const selected = photographersList.filter((p) => comparedIds.includes(String(p.id)));
      setQuotePhotographers(selected);
      setSpecificPackageSelected(undefined);
    } else {
      setQuotePhotographers([]);
      setSpecificPackageSelected(undefined);
    }
    setIsMultiQuoteOpen(true);
  };

  // View Profile Handler
  const handleViewProfile = (slug: string) => {
    navigateToView('profile', slug);
  };

  // City Search Handler
  const handleSearchCitySubmit = (city: string) => {
    setSelectedCity(city);

    navigateToView('directory');
  };

  // Admin Badge Toggle Handler
  const handleToggleBadge = async (photographerId: string, badge: 'Verificado' | 'Top Avaliado' | 'Premium') => {
    setPhotographersList((prev) =>
      prev.map((p) => {
        if (String(p.id) === String(photographerId)) {
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
      prev.map((p) => (String(p.id) === String(updated.id) ? updated : p))
    );
    fetchPhotographers();
  };

  // Active photographer for profile view
  const activePhotographer =
    photographersList.find((p) => p.slug === selectedPhotographerSlug) || photographersList[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6EEE8] text-[#5A4035] selection:bg-[#C88E9B] selection:text-white">
      {/* Header */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => navigateToView(view)}
        favoritesCount={favorites.length}
        compareCount={comparedIds.length}
        openMultiQuote={() => handleOpenQuoteModal()}
        selectedCity={selectedCity}
        userSession={userSession}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-20 md:pb-0">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed bottom-4 right-4 bg-[#5A4035] text-white text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-2 z-50">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C88E9B]" />
            <span>Sincronizando com Banco MySQL Cloud SQL...</span>
          </div>
        )}

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
                {(photographersList.filter((p) => p.featuredInHome).length > 0
                  ? photographersList.filter((p) => p.featuredInHome)
                  : photographersList.slice(0, 6)
                ).map((p) => (
                  <PhotographerCard
                    key={p.id}
                    photographer={p}
                    onViewProfile={handleViewProfile}
                    onOpenQuote={handleOpenQuoteModal}
                    isFavorite={favorites.includes(String(p.id))}
                    onToggleFavorite={() => toggleFavorite(String(p.id))}
                    isCompared={comparedIds.includes(String(p.id))}
                    onToggleCompare={() => toggleCompare(String(p.id))}
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
                {recentWeddings.slice(0, 4).map((w) => (
                  <div
                    key={w.id}
                    onClick={() => handleViewProfile(w.photographerSlug)}
                    className="bg-white rounded-2xl overflow-hidden border border-[#C88E9B]/20 shadow-xs hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="h-40 overflow-hidden relative">
                      <img
                        src={w.coverImage}
                        alt={w.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
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
                    O que as noivas dizem sobre o Guia Fotógrafo Casamento
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

        {currentView === 'notifications' && (
          userSession ? <NotificationsView /> : <AuthView initialMode="login" onLoginSuccess={handleLoginSuccess} onNavigateHome={() => navigateToView('home')} />
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
        {currentView === 'profile' && activePhotographer && (
          <PhotographerProfileView
            photographer={activePhotographer}
            onOpenQuote={handleOpenQuoteModal}
            onBack={() => setCurrentView('directory')}
            isFavorite={favorites.includes(String(activePhotographer.id))}
            onToggleFavorite={() => toggleFavorite(String(activePhotographer.id))}
            isCompared={comparedIds.includes(String(activePhotographer.id))}
            onToggleCompare={() => toggleCompare(String(activePhotographer.id))}
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
            weddings={recentWeddings}
            onViewPhotographerProfile={handleViewProfile}
            openMultiQuote={() => handleOpenQuoteModal()}
          />
        )}

        {/* VIEW 7: TOOLS FOR COUPLES / PORTAL DO CASAL */}
        {currentView === 'tools' && (
          <ToolsCoupleView
            userSession={userSession}
            onNavigateLogin={() => navigateToView('login')}
            onNavigateRegister={() => navigateToView('cadastro-noiva')}
            openMultiQuote={() => handleOpenQuoteModal()}
          />
        )}

        {/* CADASTRO DA NOIVA */}
        {currentView === 'cadastro-noiva' && (
          <BrideSignupView
            onSuccess={(user) => {
              setUserSession(user);
              navigateToView('tools');
            }}
            onNavigateLogin={() => navigateToView('login')}
          />
        )}

        {/* VIEW 8: BLOG SEO */}
        {currentView === 'blog' && (
          <BlogView openMultiQuote={() => handleOpenQuoteModal()} />
        )}

        {/* VIEW 9: PLANS & MONETIZATION */}
        {currentView === 'plans' && (
          <PlansMonetizationView openMultiQuote={() => handleOpenQuoteModal()} />
        )}

        {/* AUTH VIEWS (LOGIN, REGISTER, FORGOT PASSWORD, RESET PASSWORD) */}
        {['login', 'cadastrar-estudio', 'esqueci-minha-senha', 'redefinir-senha'].includes(currentView) && (
          <AuthView
            initialMode={
              currentView === 'cadastrar-estudio'
                ? 'register'
                : currentView === 'esqueci-minha-senha'
                ? 'forgot'
                : currentView === 'redefinir-senha'
                ? 'reset'
                : 'login'
            }
            onLoginSuccess={handleLoginSuccess}
            onNavigateHome={() => navigateToView('home')}
            onNavigateBrideRegister={() => navigateToView('cadastro-noiva')}
          />
        )}

        {/* VIEW 10: PROTECTED PHOTOGRAPHER PANEL (CRM) */}
        {currentView === 'photographer-panel' && (
          checkingAuth ? (
            <div className="py-24 text-center space-y-4 max-w-md mx-auto">
              <RefreshCw className="w-8 h-8 animate-spin text-[#C88E9B] mx-auto" />
              <p className="text-sm font-semibold text-[#5A4035]">Verificando autenticação do profissional...</p>
            </div>
          ) : !userSession ? (
            <AuthView
              initialMode="login"
              onLoginSuccess={handleLoginSuccess}
              onNavigateHome={() => navigateToView('home')}
            />
          ) : userSession.role !== 'photographer' && userSession.role !== 'admin' && userSession.role !== 'super_admin' ? (
            <AccessDeniedView
              requiredRole="Fotógrafo / Estúdio"
              currentRole={userSession.role}
              onNavigateToLogin={() => navigateToView('login')}
              onNavigateToHome={() => navigateToView('home')}
              onLogout={handleLogout}
            />
          ) : (
            <PhotographerPanel
              photographer={
                photographersList.find(p => String(p.id) === String(userSession.photographerId) || p.userUid === userSession.uid) ||
                photographerProfile ||
                photographersList[0]
              }
              onUpdatePhotographer={handleUpdatePhotographer}
              onLogout={handleLogout}
            />
          )
        )}

        {/* VIEW 11: PROTECTED ADMIN PANEL */}
        {currentView === 'admin-panel' && (
          checkingAuth ? (
            <div className="py-24 text-center space-y-4 max-w-md mx-auto">
              <RefreshCw className="w-8 h-8 animate-spin text-[#C88E9B] mx-auto" />
              <p className="text-sm font-semibold text-[#5A4035]">Verificando credenciais de administrador...</p>
            </div>
          ) : !userSession ? (
            <AuthView
              initialMode="login"
              onLoginSuccess={handleLoginSuccess}
              onNavigateHome={() => navigateToView('home')}
            />
          ) : userSession.role !== 'admin' && userSession.role !== 'super_admin' ? (
            <AccessDeniedView
              requiredRole="Administrador"
              currentRole={userSession.role}
              onNavigateToLogin={() => navigateToView('login')}
              onNavigateToHome={() => navigateToView('home')}
              onLogout={handleLogout}
            />
          ) : (
            <AdminDashboard
              photographers={photographersList}
              onToggleBadge={handleToggleBadge}
              onUpdatePhotographer={handleUpdatePhotographer}
              onLogout={handleLogout}
            />
          )
        )}
      </main>
      <PwaInstallPrompt authenticated={Boolean(userSession)} />

      {/* Footer */}
      <Footer
        setCurrentView={(v) => navigateToView(v)}
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
