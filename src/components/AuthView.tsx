import React, { useState } from 'react';
import { Camera, Lock, Mail, User, Phone, MapPin, Building, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';
import { UserSession } from '../types';

interface AuthViewProps {
  initialMode?: 'login' | 'register' | 'forgot' | 'reset';
  resetTokenParam?: string;
  onLoginSuccess: (user: UserSession, photographerProfile?: any) => void;
  onNavigateHome: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  resetTokenParam = '',
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register Fields
  const [name, setName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [city, setCity] = useState('Piracicaba');
  const [state, setState] = useState('SP');
  const [phone, setPhone] = useState('');

  // Reset Password Fields
  const [resetToken, setResetToken] = useState(resetTokenParam || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & Messaging
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      }

      onLoginSuccess(data.user, data.photographerProfile);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Photographer Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register-photographer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          studioName: studioName.trim() || name.trim(),
          city,
          state,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao realizar cadastro.');
      }

      setSuccessMessage('Cadastro do estúdio realizado com sucesso!');
      setTimeout(() => {
        onLoginSuccess(data.user, data.photographerProfile);
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar fotógrafo.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao solicitar redefinição.');
      }

      setSuccessMessage(data.message || 'Instruções de redefinição enviadas para o seu e-mail!');
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Digite novamente.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao redefinir senha.');
      }

      setSuccessMessage(data.message || 'Senha alterada com sucesso! Redirecionando para login...');
      setTimeout(() => {
        setMode('login');
        setSuccessMessage('');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to trigger fast quick-login for test reviewer
  const handleQuickLogin = async (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: userPass }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro no login rápido de teste.');
      }

      onLoginSuccess(data.user, data.photographerProfile);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha no login rápido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#F6EEE8] via-[#FAF5F0] to-[#F6EEE8]">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-[#C88E9B]/25 overflow-hidden">
        
        {/* Top Header Section */}
        <div className="bg-[#5A4035] text-white p-6 sm:p-8 text-center space-y-2 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-[#C7A86A] border border-[#C7A86A]/30 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C7A86A]" />
            <span>Guia Fotógrafo Casamento • Autenticação Segura</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {mode === 'login' && 'Acessar Conta'}
            {mode === 'register' && 'Cadastro de Fotógrafo / Estúdio'}
            {mode === 'forgot' && 'Recuperação de Senha'}
            {mode === 'reset' && 'Redefinir Nova Senha'}
          </h2>

          <p className="text-xs text-white/80 max-w-md mx-auto">
            {mode === 'login' && 'Digite suas credenciais para gerenciar seu estúdio ou o portal.'}
            {mode === 'register' && 'Anuncie seu trabalho no maior portal especializado do Brasil.'}
            {mode === 'forgot' && 'Informe o e-mail cadastrado para receber as instruções de recuperação.'}
            {mode === 'reset' && 'Defina uma nova senha segura para sua conta.'}
          </p>
        </div>

        {/* Quick Test Demo Role Selector Bar */}
        <div className="bg-[#FAF5F0] p-3 border-b border-[#C88E9B]/20 flex flex-wrap items-center justify-between gap-2 px-6 text-xs text-[#5A4035]">
          <span className="font-bold flex items-center gap-1 text-[#C88E9B]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Acesso Rápido para Testes:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleQuickLogin('admin@guiafotografocasamento.com.br', '123456')}
              className="px-2.5 py-1 bg-[#5A4035] text-white hover:bg-[#C7A86A] hover:text-[#5A4035] font-bold rounded-lg transition-all text-[11px] shadow-xs"
              title="Entrar como Administrador Geral"
            >
              👑 Administrador
            </button>
            <button
              onClick={() => handleQuickLogin('eduardo@exemplo.com.br', '123456')}
              className="px-2.5 py-1 bg-[#C88E9B] text-white hover:bg-[#b07885] font-bold rounded-lg transition-all text-[11px] shadow-xs"
              title="Entrar como Fotógrafo (Eduardo Perez)"
            >
              📷 Fotógrafo
            </button>
            <button
              onClick={() => handleQuickLogin('noiva@exemplo.com.br', '123456')}
              className="px-2.5 py-1 bg-white text-[#5A4035] border border-[#5A4035]/20 hover:bg-[#F6EEE8] font-bold rounded-lg transition-all text-[11px]"
              title="Entrar como Cliente / Noiva"
            >
              💍 Cliente / Noiva
            </button>
          </div>
        </div>

        {/* Messages Feedback */}
        {errorMessage && (
          <div className="mx-6 mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          
          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1">
                  E-mail ou Usuário
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#C88E9B] absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="w-full pl-9 pr-4 py-3 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-sm font-medium text-[#5A4035] focus:outline-none focus:ring-2 focus:ring-[#C88E9B] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setSuccessMessage('');
                      setMode('forgot');
                    }}
                    className="text-xs font-semibold text-[#C88E9B] hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#C88E9B] absolute left-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-3 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-sm font-medium text-[#5A4035] focus:outline-none focus:ring-2 focus:ring-[#C88E9B] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#C88E9B] to-[#b07885] hover:from-[#b07885] hover:to-[#5A4035] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-[#5A4035]/10 text-center text-xs text-[#5A4035]/80">
                <span>É fotógrafo e ainda não tem cadastro? </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setMode('register');
                  }}
                  className="font-bold text-[#C88E9B] hover:underline"
                >
                  Cadastrar meu estúdio
                </button>
              </div>
            </form>
          )}

          {/* REGISTER PHOTOGRAPHER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1">
                    Nome Completo *
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-[#C88E9B] absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Rafael Augusto"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-xs font-medium text-[#5A4035] focus:outline-none focus:ring-2 focus:ring-[#C88E9B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1">
                    Nome do Estúdio / Marca
                  </label>
                  <div className="relative flex items-center">
                    <Building className="w-4 h-4 text-[#C88E9B] absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      placeholder="Ex: Rafael Augusto Fotografia"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-xs font-medium text-[#5A4035] focus:outline-none focus:ring-2 focus:ring-[#C88E9B]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1">
                  E-mail Comercial *
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#C88E9B] absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@estudio.com.br"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-xs font-medium text-[#5A4035] focus:outline-none focus:ring-2 focus:ring-[#C88E9B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1">
                  Senha para Acesso *
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#C88E9B] absolute left-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-xs font-medium text-[#5A4035] focus:outline-none focus:ring-2 focus:ring-[#C88E9B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1">
                    Cidade
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-[#C88E9B] absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Piracicaba"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-xs font-medium text-[#5A4035]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1">
                    UF
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="w-full px-3 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-xs font-medium text-[#5A4035] text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1">
                  WhatsApp / Telefone Comercial
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-[#C88E9B] absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(19) 99876-5432"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-xs font-medium text-[#5A4035]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#5A4035] hover:bg-[#C88E9B] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Criando Conta do Estúdio...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-[#C7A86A]" />
                    <span>Criar Conta de Fotógrafo</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-[#5A4035]/10 text-center text-xs text-[#5A4035]/80">
                <span>Já possui uma conta? </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setMode('login');
                  }}
                  className="font-bold text-[#C88E9B] hover:underline"
                >
                  Voltar para Login
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1">
                  Seu E-mail Cadastrado
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#C88E9B] absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-9 pr-4 py-3 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-sm font-medium text-[#5A4035] focus:outline-none focus:ring-2 focus:ring-[#C88E9B]"
                  />
                </div>
              </div>

              {resetToken && (
                <div className="p-3 bg-[#FAF5F0] rounded-xl border border-[#C7A86A]/40 text-xs space-y-2">
                  <p className="font-bold text-[#5A4035] flex items-center gap-1">
                    <KeyRound className="w-4 h-4 text-[#C7A86A]" />
                    <span>Token de Redefinição Gerado:</span>
                  </p>
                  <div className="p-2 bg-white rounded border border-[#5A4035]/10 font-mono text-[11px] select-all text-[#5A4035]">
                    {resetToken}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="w-full py-1.5 bg-[#C7A86A] text-[#5A4035] font-bold rounded-lg text-xs hover:bg-[#5A4035] hover:text-white transition-colors"
                  >
                    Ir para Redefinição de Senha →
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enviando Instruções...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Solicitar Código de Recuperação</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-[#5A4035]/10 text-center text-xs text-[#5A4035]/80">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setMode('login');
                  }}
                  className="font-bold text-[#C88E9B] hover:underline"
                >
                  ← Voltar para a Tela de Login
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1">
                  Código / Token de Redefinição
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Cole o token de recuperação aqui"
                  className="w-full px-4 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-xs font-mono text-[#5A4035]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1">
                  Nova Senha *
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#C88E9B] absolute left-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-xs font-medium text-[#5A4035]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A4035] uppercase tracking-wider mb-1">
                  Confirmar Nova Senha *
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#C88E9B] absolute left-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAF5F0] border border-[#5A4035]/15 rounded-xl text-xs font-medium text-[#5A4035]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#5A4035] hover:bg-[#C88E9B] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Salvando Nova Senha...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#C7A86A]" />
                    <span>Atualizar Senha Agora</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-[#5A4035]/10 text-center text-xs text-[#5A4035]/80">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setMode('login');
                  }}
                  className="font-bold text-[#C88E9B] hover:underline"
                >
                  ← Voltar para a Tela de Login
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
