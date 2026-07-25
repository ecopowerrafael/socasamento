import React from 'react';
import { ShieldAlert, LogIn, Home, Lock } from 'lucide-react';

interface AccessDeniedViewProps {
  requiredRole: string;
  currentRole?: string;
  onNavigateToLogin: () => void;
  onNavigateToHome: () => void;
  onLogout?: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  requiredRole,
  currentRole,
  onNavigateToLogin,
  onNavigateToHome,
  onLogout,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#F6EEE8]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-[#C88E9B]/30 text-center space-y-6">
        
        <div className="w-20 h-20 bg-[#C88E9B]/15 text-[#C88E9B] rounded-full flex items-center justify-center mx-auto border border-[#C88E9B]/30 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#C88E9B] uppercase tracking-wider bg-[#FAF5F0] px-3 py-1 rounded-full border border-[#C88E9B]/20">
            Erro 403 • Acesso Proibido
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#5A4035]">
            Acesso Negado
          </h1>
          <p className="text-sm text-[#5A4035]/80 leading-relaxed">
            Sua conta atual não possui permissão de <strong>{requiredRole}</strong> para acessar esta área protegida.
          </p>
          {currentRole && (
            <p className="text-xs text-[#5A4035]/60 bg-[#FAF5F0] p-2 rounded-xl border border-[#5A4035]/10 mt-2">
              Seu perfil ativo no momento é: <span className="font-bold text-[#5A4035] uppercase">{currentRole}</span>
            </p>
          )}
        </div>

        <div className="bg-[#FAF5F0] p-4 rounded-2xl border border-[#C88E9B]/20 text-xs text-[#5A4035]/90 text-left space-y-1.5">
          <p className="font-semibold text-[#5A4035] flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-[#C88E9B]" />
            <span>Por que estou vendo esta tela?</span>
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#5A4035]/80">
            <li>Tentativa de acessar rota administrativa sem perfil de Administrador.</li>
            <li>Tentativa de acessar o painel do fotógrafo como cliente ou com dados de outro estúdio.</li>
            <li>Regra estrita de autorização validada no servidor back-end.</li>
          </ul>
        </div>

        <div className="space-y-2 pt-2">
          {onLogout ? (
            <button
              onClick={onLogout}
              className="w-full py-3 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Trocar de Conta (Fazer Login)</span>
            </button>
          ) : (
            <button
              onClick={onNavigateToLogin}
              className="w-full py-3 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Ir para a Página de Login</span>
            </button>
          )}

          <button
            onClick={onNavigateToHome}
            className="w-full py-2.5 bg-[#FAF5F0] hover:bg-[#F6EEE8] text-[#5A4035] font-semibold text-xs rounded-xl border border-[#5A4035]/15 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Voltar para a Página Inicial</span>
          </button>
        </div>

      </div>
    </div>
  );
};
