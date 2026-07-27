import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Star,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  CreditCard,
  DollarSign,
  Users,
  Check,
  X,
  Eye,
  Settings,
  Tag,
  ShieldCheck,
  Award,
  Layers,
  HelpCircle,
  Info,
  Calendar,
  Percent,
  TrendingUp,
  RefreshCw,
  Palette,
  ExternalLink,
} from 'lucide-react';

export interface PlanItem {
  id?: number;
  title: string;
  description?: string;
  icon?: string;
  isIncluded: boolean;
  isFeatured?: boolean;
  limitValue?: string;
  isUnlimited?: boolean;
  displayText?: string;
  sortOrder: number;
  status?: 'active' | 'inactive';
}

export interface PlanFeature {
  id?: number;
  featureKey: string;
  featureName: string;
  featureType: 'boolean' | 'numeric' | 'text';
  booleanValue: boolean;
  numericValue?: number | null;
  textValue?: string | null;
  isUnlimited?: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  internalName?: string;
  slug: string;
  internalCode?: string;
  shortDescription?: string;
  description?: string;
  currency: string;
  isFree: boolean;
  monthlyPrice: string;
  annualPrice: string;
  promotionalMonthlyPrice?: string;
  promotionalAnnualPrice?: string;
  annualMonthlyEquivalent?: string;
  annualSavingsAmount?: string;
  annualDiscountPercentage?: string;
  setupFee?: string;
  trialEnabled?: boolean;
  trialDays?: number;
  promotionStartAt?: string;
  promotionEndAt?: string;
  mainColor?: string;
  textColor?: string;
  buttonColor?: string;
  icon?: string;
  badgeText?: string;
  buttonText: string;
  buttonUrl?: string;
  buttonTarget?: string;
  textAbovePrice?: string;
  textBelowPrice?: string;
  isRecommended: boolean;
  isPremium: boolean;
  isFeatured: boolean;
  showOnHome: boolean;
  showOnPricingPage: boolean;
  showOnRegistration: boolean;
  showOnProfessionalDashboard: boolean;
  allowMonthlyBilling: boolean;
  allowAnnualBilling: boolean;
  allowCancel: boolean;
  allowUpgrade: boolean;
  allowDowngrade: boolean;
  sortOrder: number;
  status: 'active' | 'inactive';
  subscribersCount?: number;
  items?: PlanItem[];
  features?: PlanFeature[];
}

const DEFAULT_TECHNICAL_FEATURES: PlanFeature[] = [
  // Perfil
  { featureKey: 'public_profile', featureName: 'Perfil Público Ativo no Guia', featureType: 'boolean', booleanValue: true, numericValue: null },
  { featureKey: 'show_premium_badge', featureName: 'Selo Oficial / Destaque Premium', featureType: 'boolean', booleanValue: false, numericValue: null },
  { featureKey: 'show_whatsapp_button', featureName: 'Botão Direto de WhatsApp', featureType: 'boolean', booleanValue: false, numericValue: null },
  { featureKey: 'show_phone', featureName: 'Exibição do Telefone Comercial', featureType: 'boolean', booleanValue: true, numericValue: null },
  { featureKey: 'show_email', featureName: 'Exibição do E-mail de Contato', featureType: 'boolean', booleanValue: true, numericValue: null },
  { featureKey: 'show_social_links', featureName: 'Exibição de Redes Sociais & Links', featureType: 'boolean', booleanValue: true, numericValue: null },
  { featureKey: 'show_website', featureName: 'Exibição do Link do Site Próprio', featureType: 'boolean', booleanValue: false, numericValue: null },

  // Galeria & Mídia
  { featureKey: 'max_photos', featureName: 'Fotos no Portfólio (-1 = Ilimitado)', featureType: 'numeric', booleanValue: true, numericValue: 15, isUnlimited: false },
  { featureKey: 'max_videos', featureName: 'Vídeos & Teasers na Galeria (-1 = Ilimitado)', featureType: 'numeric', booleanValue: true, numericValue: 0, isUnlimited: false },
  { featureKey: 'max_albums', featureName: 'Álbuns de Casamentos (-1 = Ilimitado)', featureType: 'numeric', booleanValue: true, numericValue: 2, isUnlimited: false },
  { featureKey: 'max_shoot_publications', featureName: 'Ensaios Publicados (-1 = Ilimitado)', featureType: 'numeric', booleanValue: true, numericValue: 3, isUnlimited: false },

  // Área de Atuação
  { featureKey: 'max_cities', featureName: 'Cidades de Atuação (-1 = Ilimitado)', featureType: 'numeric', booleanValue: true, numericValue: 3, isUnlimited: false },
  { featureKey: 'max_states', featureName: 'Estados de Atuação (-1 = Ilimitado)', featureType: 'numeric', booleanValue: true, numericValue: 1, isUnlimited: false },

  // Leads & Orçamentos
  { featureKey: 'can_receive_leads', featureName: 'Receber Solicitações de Orçamento', featureType: 'boolean', booleanValue: true, numericValue: null },
  { featureKey: 'monthly_leads_limit', featureName: 'Limite de Respostas de Leads/Mês (-1 = Ilimitado)', featureType: 'numeric', booleanValue: true, numericValue: 5, isUnlimited: false },
  { featureKey: 'see_lead_contact_details', featureName: 'Acesso Direto ao Contato (Telefone/WhatsApp da Noiva)', featureType: 'boolean', booleanValue: false, numericValue: null },

  // Mensagens & Contato
  { featureKey: 'internal_messages', featureName: 'Chat Interno com os Noivos', featureType: 'boolean', booleanValue: true, numericValue: null },
  { featureKey: 'allow_attachments', featureName: 'Permitir Envio de Anexos/PDFs', featureType: 'boolean', booleanValue: false, numericValue: null },
  { featureKey: 'message_history_days', featureName: 'Histórico de Mensagens Retido (Dias)', featureType: 'numeric', booleanValue: true, numericValue: 30, isUnlimited: false },

  // Posicionamento na Busca
  { featureKey: 'search_priority', featureName: 'Prioridade de Posição na Busca (1-100)', featureType: 'numeric', booleanValue: true, numericValue: 10, isUnlimited: false },
  { featureKey: 'featured_home', featureName: 'Exibição em Destaque na Home', featureType: 'boolean', booleanValue: false, numericValue: null },
  { featureKey: 'show_as_recommended', featureName: 'Aparecer na Seção de Recomendados', featureType: 'boolean', booleanValue: false, numericValue: null },

  // Métricas & Relatórios
  { featureKey: 'profile_views_stats', featureName: 'Relatório de Visualizações do Perfil', featureType: 'boolean', booleanValue: true, numericValue: null },
  { featureKey: 'whatsapp_clicks_stats', featureName: 'Métrica de Cliques no WhatsApp', featureType: 'boolean', booleanValue: false, numericValue: null },
  { featureKey: 'full_reports', featureName: 'Relatório Completo de Conversão e Leads', featureType: 'boolean', booleanValue: false, numericValue: null },

  // Avaliações
  { featureKey: 'can_receive_reviews', featureName: 'Receber Avaliações e Notas dos Casais', featureType: 'boolean', booleanValue: true, numericValue: null },
  { featureKey: 'highlight_reviews', featureName: 'Destaque de Avaliações no Perfil', featureType: 'boolean', booleanValue: false, numericValue: null },

  // Recursos Adicionais
  { featureKey: 'institutional_video', featureName: 'Vídeo Institucional de Apresentação', featureType: 'boolean', booleanValue: false, numericValue: null },
  { featureKey: 'custom_banner', featureName: 'Banner de Capa Personalizado', featureType: 'boolean', booleanValue: false, numericValue: null },
  { featureKey: 'public_schedule', featureName: 'Agenda Pública de Datas Disponíveis', featureType: 'boolean', booleanValue: false, numericValue: null },
  { featureKey: 'download_contract', featureName: 'Botão Download Modelo de Contrato/PDF', featureType: 'boolean', booleanValue: false, numericValue: null },
  { featureKey: 'download_catalog', featureName: 'Download de Catálogo em PDF', featureType: 'boolean', booleanValue: false, numericValue: null },
  { featureKey: 'instagram_integration', featureName: 'Feed do Instagram Integrado', featureType: 'boolean', booleanValue: false, numericValue: null },
];

export const AdminPlansManager: React.FC = () => {
  const [subModule, setSubModule] = useState<'plans' | 'subscriptions' | 'coupons' | 'settings'>('plans');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [billingFilter, setBillingFilter] = useState<'all' | 'free' | 'monthly' | 'annual'>('all');
  const [billingCycleView, setBillingCycleView] = useState<'monthly' | 'annual'>('annual');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'pricing' | 'items' | 'features' | 'visibility' | 'preview'>('basic');
  const [saving, setSaving] = useState(false);

  // Alert State
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteAlert, setDeleteAlert] = useState<{ id: number; name: string } | null>(null);

  // Reorder State
  const [isReordering, setIsReordering] = useState(false);

  // Plan Form State
  const [formData, setFormData] = useState({
    name: '',
    internalName: '',
    slug: '',
    internalCode: '',
    shortDescription: '',
    description: '',
    currency: 'BRL',
    isFree: false,
    monthlyPrice: '189.00',
    annualPrice: '1890.00',
    promotionalMonthlyPrice: '',
    promotionalAnnualPrice: '',
    annualMonthlyEquivalent: '157.50',
    annualSavingsAmount: '378.00',
    annualDiscountPercentage: '20.00',
    setupFee: '0.00',
    trialEnabled: false,
    trialDays: 7,
    mainColor: '#C88E9B',
    textColor: '#5A4035',
    buttonColor: '#C88E9B',
    icon: 'Sparkles',
    badgeText: '',
    buttonText: 'Assinar Agora',
    buttonUrl: '',
    buttonTarget: '_self',
    textAbovePrice: '',
    textBelowPrice: '',
    isRecommended: false,
    isPremium: false,
    isFeatured: false,
    showOnHome: true,
    showOnPricingPage: true,
    showOnRegistration: true,
    showOnProfessionalDashboard: true,
    allowMonthlyBilling: true,
    allowAnnualBilling: true,
    allowCancel: true,
    allowUpgrade: true,
    allowDowngrade: true,
    sortOrder: 0,
    status: 'active' as 'active' | 'inactive',
  });

  const [formItems, setFormItems] = useState<PlanItem[]>([
    { title: 'Página exclusiva no catálogo com galeria', isIncluded: true, isFeatured: false, sortOrder: 1 },
    { title: 'Link direto para WhatsApp e Redes Sociais', isIncluded: true, isFeatured: false, sortOrder: 2 },
    { title: 'Recebimento ilimitado de pedidos de orçamento', isIncluded: true, isFeatured: true, sortOrder: 3 },
  ]);

  const [formFeatures, setFormFeatures] = useState<PlanFeature[]>(DEFAULT_TECHNICAL_FEATURES);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: search,
        status: statusFilter,
        billing: billingFilter,
      });
      const res = await fetch(`/api/admin/plans?${params}`);
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      showAlert('error', 'Erro ao carregar lista de planos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [search, statusFilter, billingFilter]);

  useEffect(() => {
    fetch('/api/admin/subscriptions?limit=100')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) setSubscriptions(data.subscriptions || []);
      })
      .catch((error) => console.error('Erro ao carregar assinaturas do MySQL:', error));
  }, []);

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  // Recalculate annual discounts & monthly equivalents on the fly
  const calculatePricing = (mPriceStr: string, aPriceStr: string) => {
    const m = parseFloat(mPriceStr) || 0;
    const a = parseFloat(aPriceStr) || 0;

    if (m > 0 && a > 0) {
      const fullYearMonthly = m * 12;
      const savings = Math.max(0, fullYearMonthly - a);
      const discountPct = Math.max(0, (savings / fullYearMonthly) * 100);
      const monthlyEquiv = a / 12;

      setFormData((prev) => ({
        ...prev,
        annualSavingsAmount: savings.toFixed(2),
        annualDiscountPercentage: discountPct.toFixed(2),
        annualMonthlyEquivalent: monthlyEquiv.toFixed(2),
      }));
    }
  };

  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      internalName: '',
      slug: '',
      internalCode: '',
      shortDescription: '',
      description: '',
      currency: 'BRL',
      isFree: false,
      monthlyPrice: '189.00',
      annualPrice: '1890.00',
      promotionalMonthlyPrice: '',
      promotionalAnnualPrice: '',
      annualMonthlyEquivalent: '157.50',
      annualSavingsAmount: '378.00',
      annualDiscountPercentage: '20.00',
      setupFee: '0.00',
      trialEnabled: false,
      trialDays: 7,
      mainColor: '#C88E9B',
      textColor: '#5A4035',
      buttonColor: '#C88E9B',
      icon: 'Sparkles',
      badgeText: '',
      buttonText: 'Assinar Agora',
      buttonUrl: '',
      buttonTarget: '_self',
      textAbovePrice: '',
      textBelowPrice: '',
      isRecommended: false,
      isPremium: false,
      isFeatured: false,
      showOnHome: true,
      showOnPricingPage: true,
      showOnRegistration: true,
      showOnProfessionalDashboard: true,
      allowMonthlyBilling: true,
      allowAnnualBilling: true,
      allowCancel: true,
      allowUpgrade: true,
      allowDowngrade: true,
      sortOrder: plans.length + 1,
      status: 'active',
    });
    setFormItems([
      { title: 'Perfil individual no Guia Fotógrafo Casamento', isIncluded: true, sortOrder: 1 },
      { title: 'Até 50 fotos de alta qualidade na galeria', isIncluded: true, sortOrder: 2 },
      { title: 'Link de contato direto e formulário de cotação', isIncluded: true, sortOrder: 3 },
    ]);
    setFormFeatures(DEFAULT_TECHNICAL_FEATURES);
    setActiveFormTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      internalName: plan.internalName || '',
      slug: plan.slug || '',
      internalCode: plan.internalCode || '',
      shortDescription: plan.shortDescription || '',
      description: plan.description || '',
      currency: plan.currency || 'BRL',
      isFree: plan.isFree,
      monthlyPrice: plan.monthlyPrice || '0.00',
      annualPrice: plan.annualPrice || '0.00',
      promotionalMonthlyPrice: plan.promotionalMonthlyPrice || '',
      promotionalAnnualPrice: plan.promotionalAnnualPrice || '',
      annualMonthlyEquivalent: plan.annualMonthlyEquivalent || '',
      annualSavingsAmount: plan.annualSavingsAmount || '',
      annualDiscountPercentage: plan.annualDiscountPercentage || '',
      setupFee: plan.setupFee || '0.00',
      trialEnabled: plan.trialEnabled || false,
      trialDays: plan.trialDays || 0,
      mainColor: plan.mainColor || '#C88E9B',
      textColor: plan.textColor || '#5A4035',
      buttonColor: plan.buttonColor || '#C88E9B',
      icon: plan.icon || 'Sparkles',
      badgeText: plan.badgeText || '',
      buttonText: plan.buttonText || 'Assinar Agora',
      buttonUrl: plan.buttonUrl || '',
      buttonTarget: plan.buttonTarget || '_self',
      textAbovePrice: plan.textAbovePrice || '',
      textBelowPrice: plan.textBelowPrice || '',
      isRecommended: plan.isRecommended,
      isPremium: plan.isPremium,
      isFeatured: plan.isFeatured,
      showOnHome: plan.showOnHome,
      showOnPricingPage: plan.showOnPricingPage,
      showOnRegistration: plan.showOnRegistration,
      showOnProfessionalDashboard: plan.showOnProfessionalDashboard,
      allowMonthlyBilling: plan.allowMonthlyBilling,
      allowAnnualBilling: plan.allowAnnualBilling,
      allowCancel: plan.allowCancel,
      allowUpgrade: plan.allowUpgrade,
      allowDowngrade: plan.allowDowngrade,
      sortOrder: plan.sortOrder || 0,
      status: plan.status || 'active',
    });

    setFormItems(
      plan.items && plan.items.length > 0
        ? plan.items
        : [
            { title: 'Perfil completo no guia', isIncluded: true, sortOrder: 1 },
            { title: 'Atendimento direto aos noivos', isIncluded: true, sortOrder: 2 },
          ]
    );

    // Merge features with default schema
    if (plan.features && plan.features.length > 0) {
      const merged = DEFAULT_TECHNICAL_FEATURES.map((def) => {
        const found = plan.features?.find((f) => f.featureKey === def.featureKey);
        return found ? { ...def, ...found } : def;
      });
      setFormFeatures(merged);
    } else {
      setFormFeatures(DEFAULT_TECHNICAL_FEATURES);
    }

    setActiveFormTab('basic');
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showAlert('error', 'O nome público do plano é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        items: formItems.filter((i) => i.title.trim().length > 0),
        features: formFeatures,
      };

      const url = editingPlan ? `/api/admin/plans/${editingPlan.id}` : '/api/admin/plans';
      const method = editingPlan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showAlert('success', data.message || 'Plano salvo com sucesso!');
        setIsModalOpen(false);
        fetchPlans();
      } else {
        showAlert('error', data.error || 'Erro ao salvar plano.');
      }
    } catch (err: any) {
      showAlert('error', err?.message || 'Falha na comunicação com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (plan: SubscriptionPlan) => {
    const newStatus = plan.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', `Status do plano '${plan.name}' alterado para ${newStatus === 'active' ? 'Ativo' : 'Inativo'}.`);
        fetchPlans();
      } else {
        showAlert('error', data.error);
      }
    } catch (err) {
      showAlert('error', 'Erro ao alterar status.');
    }
  };

  const handleToggleRecommended = async (plan: SubscriptionPlan) => {
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}/recommended`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', data.message);
        fetchPlans();
      } else {
        showAlert('error', data.error);
      }
    } catch (err) {
      showAlert('error', 'Erro ao definir recomendação.');
    }
  };

  const handleDuplicatePlan = async (plan: SubscriptionPlan) => {
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', data.message);
        fetchPlans();
      } else {
        showAlert('error', data.error);
      }
    } catch (err) {
      showAlert('error', 'Erro ao duplicar plano.');
    }
  };

  const handleDeletePlan = async () => {
    if (!deleteAlert) return;
    try {
      const res = await fetch(`/api/admin/plans/${deleteAlert.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', data.message || 'Plano excluído.');
        setDeleteAlert(null);
        fetchPlans();
      } else {
        showAlert('error', data.error || 'Não foi possível excluir.');
      }
    } catch (err) {
      showAlert('error', 'Erro na requisição.');
    }
  };

  // Item List Handlers
  const handleAddItem = () => {
    setFormItems((prev) => [
      ...prev,
      { title: '', isIncluded: true, isFeatured: false, sortOrder: prev.length + 1 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PlanItem, value: any) => {
    setFormItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Feature Handlers
  const handleFeatureToggle = (featureKey: string, val: boolean) => {
    setFormFeatures((prev) =>
      prev.map((f) => (f.featureKey === featureKey ? { ...f, booleanValue: val } : f))
    );
  };

  const handleFeatureNumericChange = (featureKey: string, val: number | null) => {
    setFormFeatures((prev) =>
      prev.map((f) => (f.featureKey === featureKey ? { ...f, numericValue: val } : f))
    );
  };

  // Stats
  const totalPlansCount = plans.length;
  const activePlansCount = plans.filter((p) => p.status === 'active').length;
  const totalSubscribersCount = plans.reduce((acc, p) => acc + (p.subscribersCount || 0), 0);
  const recommendedPlanName = plans.find((p) => p.isRecommended)?.name || 'Nenhum';

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alertMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-sm transition-all ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="text-sm font-medium">{alertMessage.text}</p>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Main Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 pb-4">
        <div>
          <h1 className="text-2xl font-serif text-[#5A4035] flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-[#C88E9B]" />
            Planos e Assinaturas
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Gerencie os planos comerciais, preços, benefícios e permissões dos fotógrafos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C88E9B] hover:bg-[#b07582] text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Criar Novo Plano
          </button>
        </div>
      </div>

      {/* Submenu Navigation */}
      <div className="flex items-center gap-1 bg-rose-50/50 p-1.5 rounded-xl border border-rose-100/80 overflow-x-auto">
        <button
          onClick={() => setSubModule('plans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            subModule === 'plans'
              ? 'bg-white text-[#5A4035] shadow-sm border border-rose-100 font-semibold'
              : 'text-stone-600 hover:text-[#5A4035] hover:bg-white/60'
          }`}
        >
          <Layers className="w-4 h-4 text-[#C88E9B]" />
          Gerenciar Planos
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-rose-100 text-[#5A4035] rounded-full font-bold">
            {totalPlansCount}
          </span>
        </button>

        <button
          onClick={() => setSubModule('subscriptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            subModule === 'subscriptions'
              ? 'bg-white text-[#5A4035] shadow-sm border border-rose-100 font-semibold'
              : 'text-stone-600 hover:text-[#5A4035] hover:bg-white/60'
          }`}
        >
          <Users className="w-4 h-4 text-[#C88E9B]" />
          Assinaturas Ativas
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full font-bold">
            {totalSubscribersCount}
          </span>
        </button>

        <button
          onClick={() => setSubModule('coupons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            subModule === 'coupons'
              ? 'bg-white text-[#5A4035] shadow-sm border border-rose-100 font-semibold'
              : 'text-stone-600 hover:text-[#5A4035] hover:bg-white/60'
          }`}
        >
          <Tag className="w-4 h-4 text-[#C88E9B]" />
          Cupons de Desconto
        </button>

        <button
          onClick={() => setSubModule('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            subModule === 'settings'
              ? 'bg-white text-[#5A4035] shadow-sm border border-rose-100 font-semibold'
              : 'text-stone-600 hover:text-[#5A4035] hover:bg-white/60'
          }`}
        >
          <Settings className="w-4 h-4 text-[#C88E9B]" />
          Configurações de Pagamento
        </button>
      </div>

      {subModule === 'plans' && (
        <div className="space-y-6">
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total de Planos</p>
                <h3 className="text-2xl font-bold text-[#5A4035] mt-1">{totalPlansCount}</h3>
                <p className="text-xs text-stone-400 mt-1">{activePlansCount} planos ativos no site</p>
              </div>
              <div className="p-3 bg-rose-50 text-[#C88E9B] rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Plano Recomendado</p>
                <h3 className="text-lg font-bold text-[#5A4035] mt-1 truncate max-w-[150px]">{recommendedPlanName}</h3>
                <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  Destaque comercial
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Assinantes Ativos</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">{totalSubscribersCount}</h3>
                <p className="text-xs text-emerald-600 mt-1">Fotógrafos pagantes</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Ciclo Comercial</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setBillingCycleView('annual')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                      billingCycleView === 'annual'
                        ? 'bg-[#C88E9B] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Anual (-20%)
                  </button>
                  <button
                    onClick={() => setBillingCycleView('monthly')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                      billingCycleView === 'monthly'
                        ? 'bg-[#C88E9B] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Mensal
                  </button>
                </div>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por nome, código ou palavra-chave..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C88E9B]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#C88E9B]"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Somente Ativos</option>
                <option value="inactive">Somente Inativos</option>
              </select>

              <select
                value={billingFilter}
                onChange={(e: any) => setBillingFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#C88E9B]"
              >
                <option value="all">Todos os Ciclos</option>
                <option value="free">Gratuito</option>
                <option value="monthly">Cobrança Mensal</option>
                <option value="annual">Cobrança Anual</option>
              </select>

              <button
                onClick={fetchPlans}
                className="p-2 text-stone-500 hover:text-[#5A4035] hover:bg-stone-100 rounded-xl transition-all"
                title="Atualizar Lista"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table of Plans */}
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-stone-500 space-y-3">
                <Loader2 className="w-8 h-8 text-[#C88E9B] animate-spin mx-auto" />
                <p className="text-sm">Carregando planos do MySQL...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Layers className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-lg font-medium text-[#5A4035]">Nenhum plano encontrado</h3>
                <p className="text-sm text-stone-500 max-w-md mx-auto">
                  Não há planos cadastrados correspondentes aos filtros selecionados.
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#C88E9B] text-white rounded-xl text-sm font-medium hover:bg-[#b07582]"
                >
                  <Plus className="w-4 h-4" /> Cadastrar Primeiro Plano
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-rose-50/50 border-b border-rose-100 text-xs font-semibold text-[#5A4035] uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-12 text-center">Ordem</th>
                      <th className="py-3.5 px-4">Plano & Código</th>
                      <th className="py-3.5 px-4">Preço Mensal</th>
                      <th className="py-3.5 px-4">Preço Anual</th>
                      <th className="py-3.5 px-4">Economia Anual</th>
                      <th className="py-3.5 px-4 text-center">Recursos</th>
                      <th className="py-3.5 px-4 text-center">Assinantes</th>
                      <th className="py-3.5 px-4 text-center">Recomendado</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {plans.map((plan) => {
                      const mPrice = parseFloat(plan.monthlyPrice) || 0;
                      const aPrice = parseFloat(plan.annualPrice) || 0;
                      const savings = parseFloat(plan.annualSavingsAmount || '0');
                      const discPct = parseFloat(plan.annualDiscountPercentage || '0');
                      const itemTotal = (plan.items?.length || 0);

                      return (
                        <tr
                          key={plan.id}
                          className="hover:bg-rose-50/30 transition-colors group"
                        >
                          {/* Order */}
                          <td className="py-4 px-4 text-center font-mono text-xs text-stone-400 font-bold">
                            #{plan.sortOrder}
                          </td>

                          {/* Name & Badge */}
                          <td className="py-4 px-4">
                            <div className="flex items-start gap-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                                style={{ backgroundColor: plan.mainColor || '#C88E9B', color: '#FFFFFF' }}
                              >
                                <Sparkles className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#5A4035]">{plan.name}</span>
                                  {plan.badgeText && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                      {plan.badgeText}
                                    </span>
                                  )}
                                  {plan.isFree && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                                      Gratuito
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                                  <span>slug: /{plan.slug}</span>
                                  {plan.internalCode && (
                                    <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-[10px] text-stone-600">
                                      {plan.internalCode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Monthly Price */}
                          <td className="py-4 px-4 font-medium text-stone-700">
                            {plan.isFree ? (
                              <span className="text-emerald-600 font-bold">Grátis</span>
                            ) : (
                              <div>
                                <span>R$ {mPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                <span className="text-xs text-stone-400"> /mês</span>
                              </div>
                            )}
                          </td>

                          {/* Annual Price */}
                          <td className="py-4 px-4 font-medium text-stone-700">
                            {plan.isFree ? (
                              <span className="text-emerald-600 font-bold">Grátis</span>
                            ) : (
                              <div>
                                <span>R$ {aPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                <span className="text-xs text-stone-400"> /ano</span>
                                {plan.annualMonthlyEquivalent && (
                                  <p className="text-[11px] text-[#C88E9B]">
                                    (R$ {parseFloat(plan.annualMonthlyEquivalent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês)
                                  </p>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Annual Savings */}
                          <td className="py-4 px-4">
                            {!plan.isFree && savings > 0 ? (
                              <div className="inline-flex flex-col">
                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/80">
                                  Economia R$ {savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                                {discPct > 0 && (
                                  <span className="text-[10px] text-emerald-600 font-bold mt-0.5">
                                    {discPct.toFixed(0)}% de desconto
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-stone-300 text-xs">—</span>
                            )}
                          </td>

                          {/* Resources Count */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#C88E9B]" />
                              {itemTotal} itens
                            </span>
                          </td>

                          {/* Subscribers */}
                          <td className="py-4 px-4 text-center">
                            <span className="font-bold text-[#5A4035] bg-rose-50 px-2.5 py-1 rounded-full text-xs">
                              {plan.subscribersCount || 0}
                            </span>
                          </td>

                          {/* Recommended Toggle */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleToggleRecommended(plan)}
                              className={`p-1.5 rounded-xl transition-all ${
                                plan.isRecommended
                                  ? 'bg-amber-100 text-amber-600 border border-amber-300 shadow-xs'
                                  : 'bg-stone-100 text-stone-400 hover:text-amber-500'
                              }`}
                              title={plan.isRecommended ? 'Plano atualmente em destaque' : 'Marcar como recomendado'}
                            >
                              <Star className={`w-4 h-4 ${plan.isRecommended ? 'fill-amber-500' : ''}`} />
                            </button>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(plan)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                plan.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                              }`}
                            >
                              {plan.status === 'active' ? 'Ativo' : 'Inativo'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditModal(plan)}
                                className="p-2 text-stone-500 hover:text-[#5A4035] hover:bg-rose-50 rounded-xl transition-all"
                                title="Editar plano"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDuplicatePlan(plan)}
                                className="p-2 text-stone-500 hover:text-[#5A4035] hover:bg-rose-50 rounded-xl transition-all"
                                title="Duplicar plano"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeleteAlert({ id: plan.id, name: plan.name })}
                                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                title="Excluir plano"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {subModule === 'subscriptions' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#5A4035]">Gerenciar Assinaturas dos Fotógrafos</h3>
              <p className="text-xs text-stone-500 mt-1">
                Acompanhe o status do plano, renovações, faturas e altere o plano dos estúdios individualmente.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              {totalSubscribersCount} Fotógrafos com Plano Ativo
            </span>
          </div>

          {/* Subscriptions Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[#5A4035] uppercase font-bold text-[11px] border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Estúdio / Fotógrafo</th>
                  <th className="py-3 px-4">Plano Atual</th>
                  <th className="py-3 px-4">Ciclo</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {subscriptions.map((sub) => {
                  const planName = sub.plan?.name || 'Sem plano';
                  const isAnnual = sub.billingCycle === 'YEARLY';
                  const price = isAnnual ? sub.plan?.annualPrice : sub.plan?.monthlyPrice;
                  const statusLabel = sub.status === 'ACTIVE' ? 'Ativa' : sub.status === 'PENDING' ? 'Pendente' : sub.status;
                  return (
                  <tr key={sub.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#5A4035]">{sub.photographer?.studioName || 'Estúdio removido'}</p>
                      <p className="text-[11px] text-stone-400">
                        {sub.photographer ? `${sub.photographer.city} - ${sub.photographer.state}` : '—'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase ${
                        sub.plan?.isPremium ? 'bg-[#C7A86A] text-[#5A4035]' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {planName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{isAnnual ? 'Anual' : sub.billingCycle === 'MONTHLY' ? 'Mensal' : sub.billingCycle}</td>
                    <td className="py-3.5 px-4 font-medium">R$ {Number(price || 0).toLocaleString('pt-BR')}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        sub.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[10px] text-stone-500">Use a aba Assinaturas para ações</span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subModule === 'coupons' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#5A4035]">Cupons de Desconto & Promocionais</h3>
              <p className="text-xs text-stone-500 mt-1">Crie códigos de desconto promocionais para assinaturas de fotógrafos.</p>
            </div>
            <button
              onClick={() => showAlert('success', 'Modal de criação de cupom aberto!')}
              className="px-4 py-2 bg-[#C88E9B] text-white text-xs font-bold rounded-xl hover:bg-[#b07582] transition-all"
            >
              + Criar Cupom
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#5A4035] text-sm">CASAL2026</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">20% OFF</span>
              </div>
              <p className="text-stone-500">Válido para plano Anual Premium de novos fotógrafos.</p>
              <p className="text-stone-400 text-[10px]">Utilizado: 18 vezes</p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#5A4035] text-sm">BLACKFRIDAY</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">30% OFF</span>
              </div>
              <p className="text-stone-500">Desconto especial de campanhas sazonais.</p>
              <p className="text-stone-400 text-[10px]">Utilizado: 42 vezes</p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#5A4035] text-sm">PARCEIRO100</span>
                <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">100% OFF</span>
              </div>
              <p className="text-stone-500">Cupom de cortesia para fotógrafos parceiros convidados.</p>
              <p className="text-stone-400 text-[10px]">Utilizado: 5 vezes</p>
            </div>
          </div>
        </div>
      )}

      {subModule === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#5A4035]">Configurações Gerais de Planos & Limites Padrão</h3>
            <p className="text-xs text-stone-500 mt-1">
              Defina as regras globais e mensagens exibidas aos fotógrafos ao atingirem limites no plano Gratuito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <h4 className="font-bold text-[#5A4035] text-sm">Limites Padrão do Plano Gratuito</h4>

              <div>
                <label className="block text-stone-600 mb-1">Fotos Máximas na Galeria Gratuita:</label>
                <input
                  type="number"
                  defaultValue={15}
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl font-bold text-[#5A4035]"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1">Cidades de Atuação no Plano Gratuito:</label>
                <input
                  type="number"
                  defaultValue={3}
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl font-bold text-[#5A4035]"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1">Respostas de Leads/Mês no Plano Gratuito:</label>
                <input
                  type="number"
                  defaultValue={5}
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl font-bold text-[#5A4035]"
                />
              </div>
            </div>

            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <h4 className="font-bold text-[#5A4035] text-sm">Avisos e Textos de Upgrade</h4>

              <div>
                <label className="block text-stone-600 mb-1">Título do Banner de Upgrade:</label>
                <input
                  type="text"
                  defaultValue="Desbloqueie Contatos Ilimitados no Plano Premium"
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl font-medium text-[#5A4035]"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1">Texto de Chamada no CRM:</label>
                <textarea
                  rows={3}
                  defaultValue="Você atingiu seu limite mensal de respostas de noivos no plano Gratuito. Faça upgrade para o Plano Premium para acessar números de WhatsApp ilimitados!"
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs text-[#5A4035]"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => showAlert('success', 'Configurações globais salvas com sucesso!')}
              className="px-6 py-2.5 bg-[#C88E9B] text-white text-xs font-bold rounded-xl hover:bg-[#b07582] transition-all shadow-xs"
            >
              Salvar Configurações Globais
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#5A4035]">Excluir Plano Commercial?</h3>
                <p className="text-xs text-stone-500">Esta ação realiza a remoção lógica do plano.</p>
              </div>
            </div>

            <p className="text-sm text-stone-600">
              Tem certeza que deseja excluir o plano <strong>"{deleteAlert.name}"</strong>? Planos com assinantes ativos não poderão ser removidos até a migração dos usuários.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteAlert(null)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePlan}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-all"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Plan Modal Form (Create & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-rose-100 my-8 overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#5A4035] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C88E9B]" />
                  {editingPlan ? `Editar Plano: ${editingPlan.name}` : 'Cadastrar Novo Plano Commercial'}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Configure os detalhes comerciais, valores, benefícios e limites técnicos.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-white rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Navigation Tabs */}
            <div className="flex items-center gap-1 px-6 pt-3 bg-stone-50 border-b border-stone-200 overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveFormTab('basic')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeFormTab === 'basic'
                    ? 'border-[#C88E9B] text-[#C88E9B] bg-white rounded-t-lg'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                1. Informações Básicas
              </button>

              <button
                onClick={() => setActiveFormTab('pricing')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeFormTab === 'pricing'
                    ? 'border-[#C88E9B] text-[#C88E9B] bg-white rounded-t-lg'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                2. Preço & Cobrança
              </button>

              <button
                onClick={() => setActiveFormTab('items')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeFormTab === 'items'
                    ? 'border-[#C88E9B] text-[#C88E9B] bg-white rounded-t-lg'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                3. Itens & Benefícios ({formItems.length})
              </button>

              <button
                onClick={() => setActiveFormTab('features')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeFormTab === 'features'
                    ? 'border-[#C88E9B] text-[#C88E9B] bg-white rounded-t-lg'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                4. Permissões Técnicas
              </button>

              <button
                onClick={() => setActiveFormTab('visibility')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeFormTab === 'visibility'
                    ? 'border-[#C88E9B] text-[#C88E9B] bg-white rounded-t-lg'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                5. Exibição & Botão
              </button>

              <button
                onClick={() => setActiveFormTab('preview')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeFormTab === 'preview'
                    ? 'border-[#C88E9B] text-[#C88E9B] bg-white rounded-t-lg'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-amber-500" /> Preview do Card
                </span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSavePlan} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* TAB 1: BASIC INFO */}
              {activeFormTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#5A4035] mb-1">
                        Nome Público do Plano *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Plano Destaque, Plano Premium, Gratuito"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C88E9B] focus:outline-none"
                      />
                      <p className="text-[11px] text-stone-400 mt-1">Visível no card comercial para os fotógrafos.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#5A4035] mb-1">
                        Nome Interno de Referência
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: dest_v2_2026, promo_black_friday"
                        value={formData.internalName}
                        onChange={(e) => setFormData({ ...formData, internalName: e.target.value })}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C88E9B] focus:outline-none"
                      />
                      <p className="text-[11px] text-stone-400 mt-1">Uso exclusivo da equipe de administração.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#5A4035] mb-1">
                        Slug URL (Identificador)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: plano-destaque"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C88E9B] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#5A4035] mb-1">
                        Código Interno do Plano
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: DESTAQUE_ANNUAL_2026"
                        value={formData.internalCode}
                        onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C88E9B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A4035] mb-1">
                      Descrição Curta
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Ideal para fotógrafos que desejam acelerar o fechamento de contratos de casamentos."
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C88E9B] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#5A4035] mb-1">
                        Texto do Selo / Badge
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: MAIS RECOMENDADO, NOVIDADE"
                        value={formData.badgeText}
                        onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C88E9B] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#5A4035] mb-1">
                        Cor Principal (Hexadecimal)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.mainColor}
                          onChange={(e) => setFormData({ ...formData, mainColor: e.target.value, buttonColor: e.target.value })}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-stone-200"
                        />
                        <input
                          type="text"
                          value={formData.mainColor}
                          onChange={(e) => setFormData({ ...formData, mainColor: e.target.value })}
                          className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#5A4035] mb-1">
                        Ordem de Exibição
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C88E9B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <input
                        type="checkbox"
                        checked={formData.isRecommended}
                        onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                        className="rounded text-[#C88E9B] focus:ring-[#C88E9B] w-4 h-4"
                      />
                      <span className="text-xs font-bold text-[#5A4035]">Plano Mais Recomendado</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="rounded text-[#C88E9B] focus:ring-[#C88E9B] w-4 h-4"
                      />
                      <span className="text-xs font-bold text-[#5A4035]">Borda Destacada no Front-end</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & BILLING */}
              {activeFormTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-900 text-sm">Plano Gratuito?</span>
                      <p className="text-xs text-emerald-700">Ao marcar como gratuito, todos os preços de assinatura serão zerados.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFree}
                        onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {!formData.isFree && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#5A4035] mb-1">
                            Preço Mensal (R$) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="189.00"
                            value={formData.monthlyPrice}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({ ...formData, monthlyPrice: val });
                              calculatePricing(val, formData.annualPrice);
                            }}
                            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#C88E9B] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#5A4035] mb-1">
                            Preço Anual Total (R$) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="1890.00"
                            value={formData.annualPrice}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({ ...formData, annualPrice: val });
                              calculatePricing(formData.monthlyPrice, val);
                            }}
                            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#C88E9B] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Auto Calculated Summary Box */}
                      <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-2">
                        <span className="text-xs font-bold text-[#5A4035] flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-[#C88E9B]" /> Cálculos Automáticos de Economia Anual
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                            <span className="text-stone-500 text-[10px] block">Equivalente Mensal</span>
                            <span className="font-bold text-[#5A4035]">
                              R$ {parseFloat(formData.annualMonthlyEquivalent || '0').toFixed(2)} /mês
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                            <span className="text-stone-500 text-[10px] block">Economia Anual (R$)</span>
                            <span className="font-bold text-emerald-700">
                              R$ {parseFloat(formData.annualSavingsAmount || '0').toFixed(2)}
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                            <span className="text-stone-500 text-[10px] block">Desconto Anual (%)</span>
                            <span className="font-bold text-emerald-700">
                              {parseFloat(formData.annualDiscountPercentage || '0').toFixed(1)}% OFF
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#5A4035] mb-1">
                            Taxa de Adesão / Setup Fee (R$)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.setupFee}
                            onChange={(e) => setFormData({ ...formData, setupFee: e.target.value })}
                            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#5A4035] mb-1">
                            Período de Teste Grátis (Dias)
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={formData.trialDays}
                              onChange={(e) => setFormData({ ...formData, trialDays: Number(e.target.value) })}
                              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                            />
                            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 shrink-0">
                              <input
                                type="checkbox"
                                checked={formData.trialEnabled}
                                onChange={(e) => setFormData({ ...formData, trialEnabled: e.target.checked })}
                                className="rounded text-[#C88E9B] w-4 h-4"
                              />
                              Ativar Trial
                            </label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-xs font-bold text-[#5A4035] block mb-2">Opções de Ciclo de Cobrança</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <label className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.allowMonthlyBilling}
                          onChange={(e) => setFormData({ ...formData, allowMonthlyBilling: e.target.checked })}
                          className="rounded text-[#C88E9B]"
                        />
                        <span>Permitir Mensal</span>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.allowAnnualBilling}
                          onChange={(e) => setFormData({ ...formData, allowAnnualBilling: e.target.checked })}
                          className="rounded text-[#C88E9B]"
                        />
                        <span>Permitir Anual</span>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.allowUpgrade}
                          onChange={(e) => setFormData({ ...formData, allowUpgrade: e.target.checked })}
                          className="rounded text-[#C88E9B]"
                        />
                        <span>Permitir Upgrade</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BENEFIT ITEMS */}
              {activeFormTab === 'items' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#5A4035]">Lista de Benefícios e Recursos</h3>
                      <p className="text-xs text-stone-500">
                        Adicione os itens exibidos no checkmark do card comercial.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3 py-1.5 bg-rose-100 text-[#5A4035] hover:bg-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Benefício
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formItems.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-start md:items-center gap-3 transition-all"
                      >
                        <span className="text-xs font-mono font-bold text-stone-400 w-6">#{index + 1}</span>

                        <div className="flex-1 w-full">
                          <input
                            type="text"
                            placeholder="Ex: Até 100 fotos na galeria principal"
                            value={item.title}
                            onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                            className="w-full p-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C88E9B]"
                          />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.isIncluded}
                              onChange={(e) => handleItemChange(index, 'isIncluded', e.target.checked)}
                              className="rounded text-emerald-600"
                            />
                            <span className={item.isIncluded ? 'text-emerald-700 font-bold' : 'text-stone-400'}>
                              {item.isIncluded ? 'Incluso (✓)' : 'Não incluso (✕)'}
                            </span>
                          </label>

                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.isFeatured}
                              onChange={(e) => handleItemChange(index, 'isFeatured', e.target.checked)}
                              className="rounded text-[#C88E9B]"
                            />
                            <span>Negrito</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-100/50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: TECHNICAL FEATURES */}
              {activeFormTab === 'features' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#5A4035]">Permissões Técnicas do Sistema</h3>
                    <p className="text-xs text-stone-500">
                      Defina os limites de uso e acessos reais que os fotógrafos com este plano terão no painel do profissional.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formFeatures.map((feat) => (
                      <div key={feat.featureKey} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#5A4035]">{feat.featureName}</span>
                          <span className="text-[10px] font-mono text-stone-400">{feat.featureKey}</span>
                        </div>

                        {feat.featureType === 'boolean' ? (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleFeatureToggle(feat.featureKey, true)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                feat.booleanValue
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-white border border-stone-200 text-stone-600'
                              }`}
                            >
                              Permitido
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeatureToggle(feat.featureKey, false)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                !feat.booleanValue
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-white border border-stone-200 text-stone-600'
                              }`}
                            >
                              Bloqueado
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="number"
                              value={feat.numericValue || 0}
                              onChange={(e) => handleFeatureNumericChange(feat.featureKey, Number(e.target.value))}
                              className="w-24 p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold"
                            />
                            <span className="text-xs text-stone-500">unidades no portfólio</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: VISIBILITY & BUTTON */}
              {activeFormTab === 'visibility' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#5A4035] mb-1">
                        Texto do Botão
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Assinar Destaque, Começar Grátis"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#5A4035] mb-1">
                        URL de Destino Customizada (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: /cadastro?plano=destaque"
                        value={formData.buttonUrl}
                        onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs font-bold text-[#5A4035] block mb-2">Locais de Exibição do Plano</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.showOnPricingPage}
                          onChange={(e) => setFormData({ ...formData, showOnPricingPage: e.target.checked })}
                          className="rounded text-[#C88E9B] w-4 h-4"
                        />
                        <div>
                          <span className="font-bold text-[#5A4035] block">Página Comercial de Planos</span>
                          <span className="text-[11px] text-stone-400">Exibir em /planos</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.showOnRegistration}
                          onChange={(e) => setFormData({ ...formData, showOnRegistration: e.target.checked })}
                          className="rounded text-[#C88E9B] w-4 h-4"
                        />
                        <div>
                          <span className="font-bold text-[#5A4035] block">Cadastro do Fotógrafo</span>
                          <span className="text-[11px] text-stone-400">Opção ao registrar conta</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.showOnProfessionalDashboard}
                          onChange={(e) => setFormData({ ...formData, showOnProfessionalDashboard: e.target.checked })}
                          className="rounded text-[#C88E9B] w-4 h-4"
                        />
                        <div>
                          <span className="font-bold text-[#5A4035] block">Painel do Profissional</span>
                          <span className="text-[11px] text-stone-400">Upgrade de plano interno</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.showOnHome}
                          onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                          className="rounded text-[#C88E9B] w-4 h-4"
                        />
                        <div>
                          <span className="font-bold text-[#5A4035] block">Página Inicial (Home)</span>
                          <span className="text-[11px] text-stone-400">Carrossel / destaque comercial</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: REALTIME PREVIEW CARD */}
              {activeFormTab === 'preview' && (
                <div className="space-y-4">
                  <div className="text-center max-w-md mx-auto">
                    <span className="text-xs font-bold text-[#C88E9B] uppercase tracking-wider block">Pré-visualização do Card</span>
                    <h3 className="text-lg font-serif font-bold text-[#5A4035]">Veja como o fotógrafo enxergará este plano</h3>
                  </div>

                  <div className="max-w-sm mx-auto bg-white rounded-3xl p-6 border-2 shadow-xl transition-all relative overflow-hidden"
                    style={{
                      borderColor: formData.isFeatured || formData.isRecommended ? formData.mainColor : '#f3f4f6',
                    }}
                  >
                    {formData.badgeText && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {formData.badgeText}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-bold text-[#5A4035]">{formData.name || 'Nome do Plano'}</h4>
                        <p className="text-xs text-stone-500 mt-1">{formData.shortDescription || 'Descrição breve comercial do plano.'}</p>
                      </div>

                      <div className="pt-2">
                        {formData.isFree ? (
                          <div className="text-3xl font-extrabold text-[#5A4035]">Grátis</div>
                        ) : (
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-extrabold text-[#5A4035]">
                                R$ {parseFloat(formData.annualPrice ? (parseFloat(formData.annualPrice) / 12).toFixed(2) : formData.monthlyPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-xs text-stone-500">/mês no plano anual</span>
                            </div>
                            <p className="text-xs text-stone-400 mt-1">
                              ou R$ {parseFloat(formData.monthlyPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no pagamento mensal
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="w-full py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all text-center"
                        style={{ backgroundColor: formData.buttonColor || '#C88E9B' }}
                      >
                        {formData.buttonText || 'Assinar Agora'}
                      </button>

                      <div className="space-y-2.5 pt-4 border-t border-stone-100">
                        <span className="text-xs font-bold text-[#5A4035] block">Incluso neste plano:</span>
                        {formItems.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            {item.isIncluded ? (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
                            )}
                            <span className={item.isIncluded ? (item.isFeatured ? 'font-bold text-[#5A4035]' : 'text-stone-700') : 'text-stone-400 line-through'}>
                              {item.title || 'Benefício customizado'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl text-sm font-medium transition-all"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#C88E9B] hover:bg-[#b07582] text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Salvar Plano Comercial
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
