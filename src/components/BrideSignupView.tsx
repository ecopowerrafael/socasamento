import React, { useState } from 'react';
import { Heart, Sparkles, CheckCircle2, ShieldCheck, Calendar, MapPin, Users, DollarSign, Camera, Lock, User, Phone, Mail, ArrowRight } from 'lucide-react';

interface BrideSignupViewProps {
  onSuccess: (user: any) => void;
  onNavigateLogin: () => void;
}

export const BrideSignupView: React.FC<BrideSignupViewProps> = ({
  onSuccess,
  onNavigateLogin,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Mandatory fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [uf, setUf] = useState('');
  const [cityName, setCityName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Optional fields
  const [weddingType, setWeddingType] = useState('');
  const [estimatedGuests, setEstimatedGuests] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [weddingStyle, setWeddingStyle] = useState('');
  const [ceremonyLocation, setCeremonyLocation] = useState('');
  const [receptionLocation, setReceptionLocation] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    if (!termsAccepted || !privacyConsent) {
      setErrorMessage('Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/register-bride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          partnerName,
          weddingDate,
          uf,
          cityName,
          termsAccepted,
          privacyConsent,
          marketingConsent,
          weddingType,
          estimatedGuests,
          estimatedBudget,
          weddingStyle,
          ceremonyLocation,
          receptionLocation,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || 'Erro ao criar conta de noiva.');
        return;
      }

      // Success
      if (data.user) {
        onSuccess(data.user);
      }
    } catch (err: any) {
      setErrorMessage('Ocorreu uma falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-[#E8DFD8] p-8 sm:p-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FAF0F2] text-[#C88E9B] mb-2 shadow-inner">
            <Heart className="w-7 h-7 fill-[#C88E9B]" />
          </div>
          <h1 className="text-3xl font-serif text-[#3D2C2E] tracking-tight">Cadastro do Casal</h1>
          <p className="text-sm text-[#7A6B68]">
            Crie sua conta gratuita no Portal do Casal e organize seu casamento de forma inteligente e integrada.
          </p>
        </div>

        {/* Steps Progress */}
        <div className="flex items-center justify-center space-x-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold transition ${
              step === 1 ? 'bg-[#C88E9B] text-white' : 'bg-[#F2EBE8] text-[#7A6B68]'
            }`}
          >
            <span>1. Dados Pessoais & Conta</span>
          </button>
          <div className="w-8 h-[2px] bg-[#E8DFD8]" />
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold transition ${
              step === 2 ? 'bg-[#C88E9B] text-white' : 'bg-[#F2EBE8] text-[#7A6B68]'
            }`}
          >
            <span>2. Detalhes do Casamento</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Seu Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A89890] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Camila Silva"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Nome do Parceiro(a) *
                  </label>
                  <div className="relative">
                    <Heart className="w-4 h-4 text-[#A89890] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Ex: Fernando Santos"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    E-mail de Acesso *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A89890] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#A89890] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(19) 99876-5432"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Senha de Acesso *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A89890] absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A89890] absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Digite a mesma senha"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Data Prevista *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#A89890] absolute left-3 top-3" />
                    <input
                      type="date"
                      required
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Estado (UF) *
                  </label>
                  <select
                    required
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] outline-none"
                  >
                    <option value="">Selecione</option>
                    <option value="AC">Acre (AC)</option>
                    <option value="AL">Alagoas (AL)</option>
                    <option value="AP">Amapá (AP)</option>
                    <option value="AM">Amazonas (AM)</option>
                    <option value="BA">Bahia (BA)</option>
                    <option value="CE">Ceará (CE)</option>
                    <option value="DF">Distrito Federal (DF)</option>
                    <option value="ES">Espírito Santo (ES)</option>
                    <option value="GO">Goiás (GO)</option>
                    <option value="MA">Maranhão (MA)</option>
                    <option value="MT">Mato Grosso (MT)</option>
                    <option value="MS">Mato Grosso do Sul (MS)</option>
                    <option value="RJ">Rio de Janeiro (RJ)</option>
                    <option value="MG">Minas Gerais (MG)</option>
                    <option value="PA">Pará (PA)</option>
                    <option value="PB">Paraíba (PB)</option>
                    <option value="PR">Paraná (PR)</option>
                    <option value="PE">Pernambuco (PE)</option>
                    <option value="PI">Piauí (PI)</option>
                    <option value="RN">Rio Grande do Norte (RN)</option>
                    <option value="SC">Santa Catarina (SC)</option>
                    <option value="RS">Rio Grande do Sul (RS)</option>
                    <option value="RO">Rondônia (RO)</option>
                    <option value="RR">Roraima (RR)</option>
                    <option value="SP">São Paulo (SP)</option>
                    <option value="SE">Sergipe (SE)</option>
                    <option value="TO">Tocantins (TO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="Ex: Piracicaba"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    if (!name || !partnerName || !email || !phone || !password || !confirmPassword || !weddingDate || !uf || !cityName) {
                      setErrorMessage('Preencha todos os dados obrigatórios antes de continuar.');
                      return;
                    }
                    if (password.length < 6 || password !== confirmPassword) {
                      setErrorMessage(password.length < 6 ? 'A senha deve ter pelo menos 6 caracteres.' : 'As senhas não coincidem.');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full py-3 bg-[#C88E9B] hover:bg-[#B57A87] text-white font-semibold rounded-xl transition shadow-md flex items-center justify-center space-x-2"
                >
                  <span>Próximo Passo: Detalhes do Casamento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Estilo do Casamento (Opcional)
                  </label>
                  <select
                    value={weddingStyle}
                    onChange={(e) => setWeddingStyle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] outline-none"
                  >
                    <option value="">Ainda não defini</option>
                    <option value="Clássico / Elegante">Clássico / Elegante</option>
                    <option value="Rústico / Campo / Fazenda">Rústico / Campo / Fazenda</option>
                    <option value="Praia / Tropical">Praia / Tropical</option>
                    <option value="Moderno / Minimalista">Moderno / Minimalista</option>
                    <option value="Boho / Vintage">Boho / Vintage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Tipo de Cerimônia (Opcional)
                  </label>
                  <input
                    type="text"
                    value={weddingType}
                    onChange={(e) => setWeddingType(e.target.value)}
                    placeholder="Ex: Religioso, Civil no Local"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Nº Estimado de Convidados (Opcional)
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-[#A89890] absolute left-3 top-3" />
                    <input
                      type="number"
                      value={estimatedGuests}
                      onChange={(e) => setEstimatedGuests(e.target.value)}
                      placeholder="150"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Orçamento Previsto R$ (Opcional)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#A89890] absolute left-3 top-3" />
                    <input
                      type="number"
                      value={estimatedBudget}
                      onChange={(e) => setEstimatedBudget(e.target.value)}
                      placeholder="80000"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8DFD8] focus:ring-2 focus:ring-[#C88E9B] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Local da Cerimônia (Opcional)
                  </label>
                  <input
                    type="text"
                    value={ceremonyLocation}
                    onChange={(e) => setCeremonyLocation(e.target.value)}
                    placeholder="Ex: Igreja Matriz / Capela da Fazenda"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E8DFD8] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4035] mb-1">
                    Local da Festa (Opcional)
                  </label>
                  <input
                    type="text"
                    value={receptionLocation}
                    onChange={(e) => setReceptionLocation(e.target.value)}
                    placeholder="Ex: Espaço de Eventos Roseiras"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E8DFD8] outline-none"
                  />
                </div>
              </div>

              {/* Terms and Privacy LGPD Consent */}
              <div className="pt-4 space-y-3 bg-[#FAF7F5] p-4 rounded-xl border border-[#E8DFD8]">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#C88E9B] focus:ring-[#C88E9B] border-gray-300 rounded"
                  />
                  <span className="text-xs text-[#5A4035]">
                    Li e concordo com os <strong>Termos de Uso</strong> e as regras de serviço da plataforma. *
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#C88E9B] focus:ring-[#C88E9B] border-gray-300 rounded"
                  />
                  <span className="text-xs text-[#5A4035]">
                    Autorizo o tratamento dos meus dados pessoais conforme a <strong>Política de Privacidade</strong> em conformidade com a LGPD. *
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#C88E9B] focus:ring-[#C88E9B] border-gray-300 rounded"
                  />
                  <span className="text-xs text-[#7A6B68]">
                    Desejo receber dicas exclusivas, novidades e ofertas de fornecedores recomendados. (Opcional)
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 text-[#5A4035] font-semibold rounded-xl transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 bg-[#C88E9B] hover:bg-[#B57A87] text-white font-semibold rounded-xl transition shadow-md flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Criando sua conta...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Concluir Cadastro</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center pt-4 border-t border-[#E8DFD8]">
          <p className="text-sm text-[#7A6B68]">
            Já tem uma conta no Portal do Casal?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="font-bold text-[#C88E9B] hover:underline"
            >
              Acessar minha conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
