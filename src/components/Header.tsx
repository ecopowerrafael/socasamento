import React, { useState } from 'react';
import { Camera, Scale, Sparkles, Menu, X, Search, User, LogOut, ShieldCheck, Bell, Home, ChevronRight } from 'lucide-react';
import { UserSession } from '../types';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  favoritesCount: number;
  compareCount: number;
  openMultiQuote: () => void;
  selectedCity?: string;
  userSession?: UserSession | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  compareCount,
  openMultiQuote,
  userSession,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'directory', label: 'Buscar Fotógrafos', mobileLabel: 'Buscar', icon: Search },
    { id: 'compare', label: 'Comparar Fotógrafos', mobileLabel: 'Comparar', count: compareCount, icon: Scale },
    { id: 'weddings', label: 'Casamentos Reais', mobileLabel: 'Casamentos', icon: Camera },
    { id: 'tools', label: 'Ferramentas para Noivas', mobileLabel: 'Noivas', icon: Sparkles },
  ];

  const goTo = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F6EEE8]/95 backdrop-blur-md border-b border-[#C88E9B]/20 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-[#5A4035] text-[#F6EEE8] text-[10px] sm:text-xs py-1.5 px-3 text-center font-medium flex items-center justify-center gap-2 min-h-7">
        <span className="inline-block w-2 h-2 rounded-full bg-[#C7A86A] animate-pulse"></span>
        <span className="sm:hidden">Portal especializado em fotógrafos de casamento</span>
        <span className="hidden sm:inline">O maior portal especializado exclusivo para Fotógrafos de Casamento do Brasil</span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentView('home')} 
            className="flex items-center cursor-pointer group"
          >
            <img 
              src="/guia-fotografo-casamento.png"
              alt="Guia Fotógrafo Casamento" 
              className="h-11 sm:h-16 max-w-[150px] sm:max-w-[220px] object-contain transition-transform group-hover:scale-105"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'directory' && currentView.startsWith('city-'));
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                    isActive
                      ? 'bg-[#C88E9B]/15 text-[#5A4035] font-semibold border border-[#C88E9B]/30'
                      : 'text-[#5A4035]/80 hover:text-[#5A4035] hover:bg-[#C88E9B]/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C88E9B]' : 'text-[#5A4035]/60'}`} />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-1 bg-[#C88E9B] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs & Auth User Session */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Multi quote button */}
            <button
              onClick={openMultiQuote}
              className="flex items-center gap-2 bg-[#C88E9B] hover:bg-[#b07885] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C7A86A]" />
              <span>Cotação Múltipla</span>
            </button>

            {/* Account Status / Login */}
            {userSession ? (
              <>
              <NotificationBell onOpenAll={() => setCurrentView('notifications')} />
              <div className="flex items-center gap-2 bg-white/80 border border-[#5A4035]/15 p-1.5 pl-3 rounded-xl">
                <div className="text-left leading-tight">
                  <span className="block text-xs font-bold text-[#5A4035] truncate max-w-[120px]">
                    {userSession.name || userSession.email}
                  </span>
                  <span className="block text-[10px] font-semibold text-[#C88E9B] uppercase">
                    {userSession.role === 'admin' || userSession.role === 'super_admin' ? '👑 Admin' : userSession.role === 'photographer' ? '📷 Fotógrafo' : '💍 Noiva / Casal'}
                  </span>
                </div>

                <div className="flex items-center gap-1 border-l border-[#5A4035]/10 pl-2">
                  {(userSession.role === 'bride' || userSession.role === 'client') && (
                    <button
                      onClick={() => setCurrentView('tools')}
                      className="p-1.5 bg-[#C88E9B] text-white hover:bg-[#b07885] rounded-lg transition-colors text-xs font-bold"
                      title="Ir para o Portal do Casal"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  )}

                  {(userSession.role === 'admin' || userSession.role === 'super_admin') && (
                    <button
                      onClick={() => setCurrentView('admin-panel')}
                      className="p-1.5 bg-[#5A4035] text-white hover:bg-[#C7A86A] hover:text-[#5A4035] rounded-lg transition-colors text-xs font-bold"
                      title="Ir para o Painel Administrativo"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  )}

                  {(userSession.role === 'photographer' || userSession.role === 'admin' || userSession.role === 'super_admin') && (
                    <button
                      onClick={() => setCurrentView('photographer-panel')}
                      className="p-1.5 bg-[#C88E9B] text-white hover:bg-[#b07885] rounded-lg transition-colors text-xs font-bold"
                      title="Ir para o Painel do Profissional"
                    >
                      <User className="w-4 h-4" />
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-xs font-bold"
                      title="Sair da Conta (Logout)"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('cadastro-noiva')}
                  className="hidden xl:flex items-center gap-1.5 bg-[#5A4035] hover:bg-[#432e26] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C7A86A]" />
                  <span>Cadastrar Casamento</span>
                </button>
                <button
                  onClick={() => setCurrentView('login')}
                  className="flex items-center gap-1.5 border border-[#5A4035]/20 hover:border-[#C88E9B] bg-white hover:bg-[#FAF5F0] text-[#5A4035] px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <User className="w-4 h-4 text-[#C88E9B]" />
                  <span>Entrar / Login</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={openMultiQuote}
              className="h-10 px-3 bg-[#C88E9B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Cotar</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`h-10 w-10 grid place-items-center rounded-xl border shadow-sm transition-colors ${
                mobileMenuOpen
                  ? 'bg-[#5A4035] border-[#5A4035] text-white'
                  : 'bg-white border-[#5A4035]/15 text-[#5A4035]'
              }`}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <>
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 top-[92px] z-40 bg-[#2d1d17]/35 backdrop-blur-[2px] lg:hidden"
        />
        <div className="absolute left-0 right-0 top-full z-50 lg:hidden max-h-[calc(100dvh-92px)] overflow-y-auto rounded-b-3xl bg-[#FAF7F5] border-b border-[#C88E9B]/30 px-4 pt-4 pb-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C88E9B]">Navegação</span>
              <h2 className="font-serif text-xl font-bold text-[#5A4035]">Menu principal</h2>
            </div>
            <span className="rounded-full bg-[#F1E6E2] px-3 py-1 text-[10px] font-bold text-[#5A4035]">Guia Fotógrafo</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => goTo('home')}
              className={`w-full min-h-14 flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                currentView === 'home'
                  ? 'bg-[#5A4035] text-white shadow-md'
                  : 'bg-white text-[#5A4035] border border-[#5A4035]/10'
              }`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${currentView === 'home' ? 'bg-white/15' : 'bg-[#FAF0F2] text-[#C88E9B]'}`}>
                <Home className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm font-bold">Página Inicial</span>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
            </button>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'directory' && currentView.startsWith('city-'));
              return (
                <button
                  key={item.id}
                  onClick={() => goTo(item.id)}
                  className={`w-full min-h-14 flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                    isActive
                      ? 'bg-[#5A4035] text-white shadow-md'
                      : 'bg-white text-[#5A4035] border border-[#5A4035]/10'
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${isActive ? 'bg-white/15' : 'bg-[#FAF0F2] text-[#C88E9B]'}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 whitespace-normal text-sm font-bold leading-tight">{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="grid min-w-6 h-6 place-items-center rounded-full bg-[#C88E9B] px-1.5 text-[10px] font-bold text-white">
                      {item.count}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openMultiQuote();
            }}
            className="w-full min-h-14 rounded-2xl bg-gradient-to-r from-[#C88E9B] to-[#b07885] px-5 py-3 text-sm font-bold text-white shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Solicitar Cotação Múltipla
          </button>

          {/* Mobile Account Section */}
          <div className="pt-4 border-t border-[#5A4035]/10">
            {userSession ? (
              <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 border border-[#5A4035]/10">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#5A4035] text-white"><User className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-[#5A4035]">{userSession.name || userSession.email}</span>
                  <span className="block text-[10px] text-[#C88E9B] uppercase font-bold">
                    {userSession.role === 'admin' || userSession.role === 'super_admin' ? 'Administrador' : userSession.role === 'photographer' ? 'Fotógrafo / Estúdio' : 'Noiva / Casal'}
                  </span>
                </div>
              </div>
              <button onClick={() => goTo('notifications')} className="w-full min-h-12 bg-white px-4 py-3 rounded-xl border border-[#5A4035]/10 text-sm font-bold flex items-center gap-3 text-[#5A4035]"><Bell className="w-4 h-4 text-[#C88E9B]" /> Central de Notificações</button>
              {(userSession.role === 'bride' || userSession.role === 'client') && (
                <button onClick={() => goTo('tools')} className="w-full min-h-12 bg-white px-4 py-3 rounded-xl border border-[#5A4035]/10 text-sm font-bold flex items-center gap-3 text-[#5A4035]"><Sparkles className="w-4 h-4 text-[#C88E9B]" /> Abrir Portal do Casal</button>
              )}
              {(userSession.role === 'photographer' || userSession.role === 'admin' || userSession.role === 'super_admin') && (
                <button onClick={() => goTo('photographer-panel')} className="w-full min-h-12 bg-white px-4 py-3 rounded-xl border border-[#5A4035]/10 text-sm font-bold flex items-center gap-3 text-[#5A4035]"><User className="w-4 h-4 text-[#C88E9B]" /> Abrir Painel do Profissional</button>
              )}
              {(userSession.role === 'admin' || userSession.role === 'super_admin') && (
                <button onClick={() => goTo('admin-panel')} className="w-full min-h-12 bg-white px-4 py-3 rounded-xl border border-[#5A4035]/10 text-sm font-bold flex items-center gap-3 text-[#5A4035]"><ShieldCheck className="w-4 h-4 text-[#C88E9B]" /> Abrir Painel Administrativo</button>
              )}
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full min-h-12 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 text-sm font-bold flex items-center gap-3 text-rose-700"
                >
                  <LogOut className="w-4 h-4" /> Sair da Conta
                </button>
              )}
              </div>
            ) : (
              <div className="grid gap-2">
                <button
                  onClick={() => goTo('cadastro-noiva')}
                  className="w-full min-h-12 bg-[#5A4035] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 px-4"
                >
                  <Sparkles className="w-4 h-4 text-[#C7A86A]" />
                  Criar Conta Gratuita para Noivas
                </button>
                <button
                  onClick={() => goTo('login')}
                  className="w-full min-h-12 bg-white border border-[#5A4035]/15 text-[#5A4035] font-bold text-sm rounded-xl flex items-center justify-center gap-2 px-4"
                >
                  <User className="w-4 h-4 text-[#C88E9B]" />
                  Entrar na Minha Conta
                </button>
              </div>
            )}
          </div>
        </div>
        </>
      )}

      {/* Mobile app-style bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 grid h-[72px] grid-cols-5 border-t border-[#5A4035]/10 bg-white/95 px-1 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(90,64,53,0.12)] backdrop-blur-xl md:hidden">
        {[
          { id: 'home', label: 'Início', icon: Home },
          ...navItems,
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'directory' && currentView.startsWith('city-'));
          return (
            <button
              key={item.id}
              onClick={() => goTo(item.id)}
              className={`relative min-w-0 rounded-xl px-1 py-1 text-center transition-colors ${
                isActive ? 'text-[#C88E9B]' : 'text-[#5A4035]/65'
              }`}
            >
              <span className={`mx-auto mb-0.5 grid h-7 w-9 place-items-center rounded-xl ${isActive ? 'bg-[#FAE8EC]' : ''}`}>
                <Icon className={`h-[18px] w-[18px] ${isActive ? 'stroke-[2.5]' : ''}`} />
              </span>
              <span className="block whitespace-nowrap text-[9px] font-bold leading-tight">
                {'mobileLabel' in item ? item.mobileLabel : item.label}
              </span>
              {'count' in item && Number(item.count || 0) > 0 && (
                <span className="absolute right-2 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#C88E9B] px-1 text-[8px] font-bold text-white">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
