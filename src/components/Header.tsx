import React, { useState } from 'react';
import { Camera, Scale, Sparkles, Menu, X, Search, User, LogOut, ShieldCheck } from 'lucide-react';
import { UserSession } from '../types';

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
    { id: 'directory', label: 'Buscar Fotógrafos', icon: Search },
    { id: 'compare', label: 'Comparar', count: compareCount, icon: Scale },
    { id: 'weddings', label: 'Casamentos Reais', icon: Camera },
    { id: 'tools', label: 'Ferramentas Noivas', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F6EEE8]/95 backdrop-blur-md border-b border-[#C88E9B]/20 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-[#5A4035] text-[#F6EEE8] text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[#C7A86A] animate-pulse"></span>
        <span>O maior portal especializado exclusivo para Fotógrafos de Casamento do Brasil</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentView('home')} 
            className="flex items-center cursor-pointer group"
          >
            <img 
              src="https://loteria.rafaelaugusto.shop/wp-content/uploads/2026/07/ChatGPT-Image-23-de-jul.-de-2026-13_34_25.png" 
              alt="Guia Fotógrafo Casamento" 
              referrerPolicy="no-referrer"
              className="h-11 sm:h-13 max-w-[200px] sm:max-w-[260px] object-contain transition-transform group-hover:scale-105"
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
          <div className="hidden md:flex items-center gap-3">
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
              <div className="flex items-center gap-2 bg-white/80 border border-[#5A4035]/15 p-1.5 pl-3 rounded-xl">
                <div className="text-left leading-tight">
                  <span className="block text-xs font-bold text-[#5A4035] truncate max-w-[120px]">
                    {userSession.name || userSession.email}
                  </span>
                  <span className="block text-[10px] font-semibold text-[#C88E9B] uppercase">
                    {userSession.role === 'admin' || userSession.role === 'super_admin' ? '👑 Admin' : userSession.role === 'photographer' ? '📷 Fotógrafo' : '💍 Cliente'}
                  </span>
                </div>

                <div className="flex items-center gap-1 border-l border-[#5A4035]/10 pl-2">
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
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                className="flex items-center gap-1.5 border border-[#5A4035]/20 hover:border-[#C88E9B] bg-white hover:bg-[#FAF5F0] text-[#5A4035] px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <User className="w-4 h-4 text-[#C88E9B]" />
                <span>Entrar / Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={openMultiQuote}
              className="bg-[#C88E9B] text-white p-2 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4 text-[#C7A86A]" />
              <span className="hidden sm:inline">Cotar</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-white border border-[#5A4035]/15 text-[#5A4035]"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF5F0] border-b border-[#C88E9B]/30 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium text-left ${
                    currentView === item.id ? 'bg-[#C88E9B] text-white font-semibold' : 'bg-white text-[#5A4035] border border-[#5A4035]/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Account Section */}
          <div className="pt-2 border-t border-[#5A4035]/10">
            {userSession ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#5A4035]/10">
                <div>
                  <span className="block text-xs font-bold text-[#5A4035]">{userSession.name}</span>
                  <span className="block text-[10px] text-[#C88E9B] uppercase font-bold">{userSession.role}</span>
                </div>
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg"
                  >
                    Sair
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setCurrentView('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#5A4035] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-[#C7A86A]" />
                <span>Entrar / Área do Profissional</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
