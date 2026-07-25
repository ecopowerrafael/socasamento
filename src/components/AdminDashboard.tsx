import React, { useState } from 'react';
import { ShieldCheck, Users, Building2, DollarSign, Sparkles, Check, X, Search, Edit, Calendar, AlertTriangle, FileText, Plus, Trash2, Clock, MessageSquare, RefreshCw, Eye, Tag, MapPin, FolderPlus, LogOut } from 'lucide-react';
import { BRAZIL_STATES, BLOG_ARTICLES } from '../data/mockData';
import { Photographer, BlogArticle } from '../types';
import { AdminCategoriesManager } from './admin/AdminCategoriesManager';
import { AdminLocationsManager } from './admin/AdminLocationsManager';
import { AdminPlansManager } from './admin/AdminPlansManager';
import { AdminInspirationsManager } from './admin/AdminInspirationsManager';

interface AdminDashboardProps {
  photographers: Photographer[];
  onToggleBadge: (photographerId: string, badge: 'Verificado' | 'Top Avaliado' | 'Premium') => void;
  onUpdatePhotographer?: (updated: Photographer) => void;
  initialTab?: 'plans' | 'subscriptions' | 'studios' | 'blog' | 'overview' | 'categories' | 'locations' | 'inspirations';
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  photographers,
  onToggleBadge,
  onUpdatePhotographer,
  initialTab = 'plans',
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions' | 'studios' | 'blog' | 'overview' | 'categories' | 'locations' | 'inspirations'>(initialTab);
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Editing studio modal state
  const [editingStudio, setEditingStudio] = useState<Photographer | null>(null);

  // Blog posts management state
  const [blogPosts, setBlogPosts] = useState<BlogArticle[]>(BLOG_ARTICLES);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogArticle | null>(null);

  // Blog form fields
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Dicas de Fotografia');
  const [blogAuthor, setBlogAuthor] = useState('Equipe Guia Fotógrafo Casamento');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState('');
  const [blogReadTime, setBlogReadTime] = useState('5 min de leitura');

  // Simulated subscription mock metadata for photographers
  const getSubscriptionInfo = (index: number) => {
    if (index === 0) return { status: 'Ativa' as const, daysLeft: 180, expirationDate: '20/01/2027', price: 189 };
    if (index === 1) return { status: 'Preste a Vencer' as const, daysLeft: 5, expirationDate: '28/07/2026', price: 189 };
    if (index === 2) return { status: 'Ativa' as const, daysLeft: 90, expirationDate: '23/10/2026', price: 99 };
    if (index === 3) return { status: 'Preste a Vencer' as const, daysLeft: 8, expirationDate: '31/07/2026', price: 189 };
    if (index === 4) return { status: 'Vencida' as const, daysLeft: -12, expirationDate: '11/07/2026', price: 0 };
    return { status: 'Ativa' as const, daysLeft: 120, expirationDate: '20/11/2026', price: 99 };
  };

  const photographersWithSubs = photographers.map((p, i) => ({
    ...p,
    sub: getSubscriptionInfo(i),
  }));

  const filteredPhotographers = photographersWithSubs.filter((p) =>
    p.studioName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.city.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredSubscriptions = filteredPhotographers.filter((p) => {
    if (subscriptionFilter === 'active') return p.sub.status === 'Ativa';
    if (subscriptionFilter === 'expiring') return p.sub.status === 'Preste a Vencer';
    if (subscriptionFilter === 'expired') return p.sub.status === 'Vencida';
    return true;
  });

  // Studio Edit Handler
  const handleSaveStudioEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudio) return;

    if (onUpdatePhotographer) {
      onUpdatePhotographer(editingStudio);
    }
    alert(`Perfil do estúdio "${editingStudio.studioName}" atualizado com sucesso!`);
    setEditingStudio(null);
  };

  // Blog Open Add Modal
  const handleOpenNewPostModal = () => {
    setEditingBlogPost(null);
    setBlogTitle('');
    setBlogCategory('Dicas de Fotografia');
    setBlogAuthor('Equipe Guia Fotógrafo Casamento');
    setBlogExcerpt('');
    setBlogContent('');
    setBlogImage('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80');
    setBlogReadTime('5 min de leitura');
    setIsBlogModalOpen(true);
  };

  // Blog Open Edit Modal
  const handleOpenEditPostModal = (post: BlogArticle) => {
    setEditingBlogPost(post);
    setBlogTitle(post.title);
    setBlogCategory(post.category);
    setBlogAuthor(post.author);
    setBlogExcerpt(post.excerpt);
    setBlogContent(post.content);
    setBlogImage(post.image);
    setBlogReadTime(post.readTime);
    setIsBlogModalOpen(true);
  };

  // Blog Save Handler
  const handleSaveBlogPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) return;

    if (editingBlogPost) {
      setBlogPosts((prev) =>
        prev.map((art) =>
          art.id === editingBlogPost.id
            ? {
                ...art,
                title: blogTitle,
                category: blogCategory,
                author: blogAuthor,
                excerpt: blogExcerpt,
                content: blogContent,
                image: blogImage || art.image,
                readTime: blogReadTime,
              }
            : art
        )
      );
      alert('Artigo atualizado com sucesso!');
    } else {
      const newArt: BlogArticle = {
        id: 'b_' + Date.now(),
        slug: blogTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        title: blogTitle,
        category: blogCategory,
        author: blogAuthor,
        date: '23 de Julho de 2026',
        excerpt: blogExcerpt || 'Artigo informativo sobre fotografia de casamento.',
        content: blogContent || 'Conteúdo do artigo...',
        image: blogImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        readTime: blogReadTime || '4 min de leitura',
        seoKeywords: ['casamento', 'fotografia'],
      };
      setBlogPosts((prev) => [newArt, ...prev]);
      alert('Novo artigo publicado no blog do portal!');
    }
    setIsBlogModalOpen(false);
  };

  // Blog Delete Handler
  const handleDeleteBlogPost = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este artigo do blog?')) {
      setBlogPosts((prev) => prev.filter((art) => art.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-[#5A4035] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-[#C7A86A] border border-[#C7A86A]/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C7A86A]" />
            <span>Administração do Portal Nacional</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            Guia Fotógrafo Casamento • Gestão
          </h1>
          <p className="text-xs text-white/80">
            Gerenciamento de estúdios, controle financeiro de assinaturas e publicação no blog
          </p>
        </div>

        {/* Top Navigation Tabs & Logout */}
        <div className="flex flex-wrap items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/15 text-xs">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'plans' ? 'bg-[#C88E9B] text-white shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Planos e Assinaturas</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'subscriptions' ? 'bg-[#C88E9B] text-white' : 'text-white/80 hover:text-white'
            }`}
          >
            Assinaturas
          </button>
          <button
            onClick={() => setActiveTab('studios')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'studios' ? 'bg-[#C88E9B] text-white' : 'text-white/80 hover:text-white'
            }`}
          >
            Gerenciar Estúdios
          </button>

          {/* Cadastros Group */}
          <div className="h-6 w-px bg-white/20 my-auto hidden sm:block" />
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'categories' ? 'bg-[#C7A86A] text-[#5A4035]' : 'text-white/80 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categorias</span>
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'locations' ? 'bg-[#C7A86A] text-[#5A4035]' : 'text-white/80 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Localidades</span>
          </button>

          <button
            onClick={() => setActiveTab('inspirations')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'inspirations' ? 'bg-[#C7A86A] text-[#5A4035]' : 'text-white/80 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inspirações (Pinterest)</span>
          </button>

          <button
            onClick={() => setActiveTab('blog')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'blog' ? 'bg-[#C88E9B] text-white' : 'text-white/80 hover:text-white'
            }`}
          >
            Blog
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'overview' ? 'bg-[#C88E9B] text-white' : 'text-white/80 hover:text-white'
            }`}
          >
            Visão Geral
          </button>

          {onLogout && (
            <>
              <div className="h-6 w-px bg-white/20 my-auto hidden sm:block" />
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl font-bold bg-red-500/20 text-red-200 hover:bg-red-500/40 hover:text-white transition-all flex items-center gap-1.5"
                title="Sair do Painel Administrativo"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* General High-Level Executive Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
          <span className="text-xs font-bold text-[#5A4035]/60 uppercase block">Receita Recorrente (MRR)</span>
          <span className="text-2xl font-serif font-bold text-[#C7A86A]">R$ 184.500</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">↑ Assinaturas Ativas no Portal</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
          <span className="text-xs font-bold text-[#5A4035]/60 uppercase block">Assinaturas Ativas</span>
          <span className="text-2xl font-serif font-bold text-[#5A4035]">7.240</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Planos Destaque & Premium</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
          <span className="text-xs font-bold text-[#5A4035]/60 uppercase block">Prestes a Vencer</span>
          <span className="text-2xl font-serif font-bold text-amber-600">342</span>
          <span className="text-[10px] text-amber-600 font-semibold block mt-1">Vencem nos próximos 15 dias</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
          <span className="text-xs font-bold text-[#5A4035]/60 uppercase block">Assinaturas Vencidas</span>
          <span className="text-2xl font-serif font-bold text-rose-600">128</span>
          <span className="text-[10px] text-rose-600 font-semibold block mt-1">Aguardando renovação</span>
        </div>
      </div>

      {/* TAB: PLANOS E ASSINATURAS */}
      {activeTab === 'plans' && <AdminPlansManager />}

      {/* TAB: CATEGORIAS DE SERVIÇOS */}
      {activeTab === 'categories' && <AdminCategoriesManager />}

      {/* TAB: ESTADOS E CIDADES */}
      {activeTab === 'locations' && <AdminLocationsManager />}

      {/* TAB: INSPIRAÇÕES (PINTEREST INTERNO) */}
      {activeTab === 'inspirations' && <AdminInspirationsManager />}

      {/* TAB 1: GESTÃO DE ASSINATURAS */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#C88E9B]/20 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#5A4035]">Gestão Financeira de Assinaturas</h2>
              <p className="text-xs text-[#5A4035]/70">Controle de renovações, avisos de vencimento e cobranças dos estúdios</p>
            </div>

            {/* Subscription Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-[#FAF5F0] p-1 rounded-xl border border-[#C88E9B]/20 text-xs">
              <button
                onClick={() => setSubscriptionFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  subscriptionFilter === 'all' ? 'bg-[#5A4035] text-white' : 'text-[#5A4035]/70 hover:text-[#5A4035]'
                }`}
              >
                Todas ({filteredPhotographers.length})
              </button>
              <button
                onClick={() => setSubscriptionFilter('active')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  subscriptionFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-[#5A4035]/70 hover:text-[#5A4035]'
                }`}
              >
                Ativas
              </button>
              <button
                onClick={() => setSubscriptionFilter('expiring')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  subscriptionFilter === 'expiring' ? 'bg-amber-500 text-white' : 'text-[#5A4035]/70 hover:text-[#5A4035]'
                }`}
              >
                Preste a Vencer
              </button>
              <button
                onClick={() => setSubscriptionFilter('expired')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  subscriptionFilter === 'expired' ? 'bg-rose-600 text-white' : 'text-[#5A4035]/70 hover:text-[#5A4035]'
                }`}
              >
                Vencidas
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF5F0] border-b border-[#C88E9B]/20 text-[#5A4035]">
                  <th className="p-3 font-bold">Estúdio / Fotógrafo</th>
                  <th className="p-3 font-bold">Plano</th>
                  <th className="p-3 font-bold">Valor Mensal</th>
                  <th className="p-3 font-bold">Data de Vencimento</th>
                  <th className="p-3 font-bold text-center">Status Assinatura</th>
                  <th className="p-3 font-bold text-center">Ações de Cobrança</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#5A4035]/10 text-[#5A4035]">
                {filteredSubscriptions.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF5F0]/50">
                    <td className="p-3 flex items-center gap-2">
                      <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <span className="font-bold block">{p.studioName}</span>
                        <span className="text-[10px] text-[#5A4035]/60">{p.city} - {p.state} • {p.phone}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-[#FAF5F0] border border-[#C88E9B]/30 px-2 py-0.5 rounded font-bold text-[10px]">
                        {p.plan}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-[#5A4035]">
                      {p.sub.price > 0 ? `R$ ${p.sub.price}/mês` : 'Gratuito'}
                    </td>
                    <td className="p-3 font-semibold text-[#5A4035]/80">
                      {p.sub.expirationDate}
                    </td>
                    <td className="p-3 text-center">
                      {p.sub.status === 'Ativa' && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                          ✓ Ativa
                        </span>
                      )}
                      {p.sub.status === 'Preste a Vencer' && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-300 flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Preste a Vencer ({p.sub.daysLeft} dias)
                        </span>
                      )}
                      {p.sub.status === 'Vencida' && (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-300">
                          ✕ Vencida
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={`https://wa.me/${p.whatsapp?.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(p.studioName)}!%20Lembrete%20de%20renova%C3%A7%C3%A3o%20da%20sua%20assinatura%20no%20S%C3%B3%20Fot%C3%B3grafos.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-[#25D366] text-white rounded-lg font-bold text-[10px] flex items-center gap-1 hover:bg-[#1ebd59]"
                          title="Cobrar via WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 fill-white" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          onClick={() => alert(`Assinatura do estúdio ${p.studioName} renovada por +1 Ano!`)}
                          className="px-2.5 py-1 bg-[#5A4035] text-white rounded-lg font-bold text-[10px] hover:bg-[#432e26]"
                        >
                          Renovar +1 Ano
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GERENCIAR ESTÚDIOS */}
      {activeTab === 'studios' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#C88E9B]/20 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#5A4035]">Gerenciar Estúdios & Fotógrafos</h2>
              <p className="text-xs text-[#5A4035]/70">Editar dados, ajustar planos e alternar selos dos parceiros</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#C88E9B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por estúdio ou cidade..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl text-xs font-medium text-[#5A4035]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF5F0] border-b border-[#C88E9B]/20 text-[#5A4035]">
                  <th className="p-3 font-bold">Estúdio / Fotógrafo</th>
                  <th className="p-3 font-bold">Cidade / Estado</th>
                  <th className="p-3 font-bold">Plano</th>
                  <th className="p-3 font-bold text-center">Selos de Qualidade</th>
                  <th className="p-3 font-bold text-center">Ações Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#5A4035]/10 text-[#5A4035]">
                {filteredPhotographers.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF5F0]/50">
                    <td className="p-3 flex items-center gap-2">
                      <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-lg object-cover" />
                      <div>
                        <span className="font-bold block text-sm">{p.studioName}</span>
                        <span className="text-[10px] text-[#5A4035]/60">{p.name} • Tel: {p.phone}</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold">{p.city}, {p.state}</td>
                    <td className="p-3">
                      <span className="bg-[#FAF5F0] border border-[#C88E9B]/30 px-2.5 py-1 rounded-md font-bold text-[10px]">
                        {p.plan}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onToggleBadge(p.id, 'Verificado')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.badges.includes('Verificado') ? 'bg-[#5A4035] text-[#C7A86A]' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          Verificado
                        </button>
                        <button
                          onClick={() => onToggleBadge(p.id, 'Top Avaliado')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.badges.includes('Top Avaliado') ? 'bg-[#C7A86A] text-[#5A4035]' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          Top
                        </button>
                        <button
                          onClick={() => onToggleBadge(p.id, 'Premium')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.badges.includes('Premium') ? 'bg-[#C88E9B] text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          Premium
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setEditingStudio({ ...p })}
                        className="px-3 py-1.5 bg-[#C88E9B] hover:bg-[#b07885] text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 mx-auto transition-colors shadow-xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar Perfil do Estúdio</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GERENCIAMENTO DO BLOG */}
      {activeTab === 'blog' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#C88E9B]/20 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#5A4035]">Gerenciamento de Posts do Blog</h2>
              <p className="text-xs text-[#5A4035]/70">Crie, edite e publique artigos e orientações para os noivos do portal</p>
            </div>

            <button
              onClick={handleOpenNewPostModal}
              className="px-5 py-2.5 bg-[#C88E9B] hover:bg-[#b07885] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#C7A86A]" />
              <span>+ Criar Novo Post no Blog</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-[#FAF5F0] p-5 rounded-2xl border border-[#C88E9B]/20 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={post.image} alt={post.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <span className="bg-[#5A4035] text-[#C7A86A] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {post.category}
                      </span>
                      <h3 className="font-serif font-bold text-sm text-[#5A4035] leading-snug mt-1">{post.title}</h3>
                      <p className="text-[10px] text-[#5A4035]/60 mt-0.5">Por: {post.author} • {post.date}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#5A4035]/80 line-clamp-2 italic bg-white p-2.5 rounded-xl border border-[#5A4035]/10">
                    "{post.excerpt}"
                  </p>
                </div>

                <div className="pt-2 border-t border-[#5A4035]/10 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Publicado
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditPostModal(post)}
                      className="px-3 py-1 bg-white border border-[#5A4035]/20 text-[#5A4035] rounded-lg font-bold text-[10px] hover:bg-[#F6EEE8]"
                    >
                      Editar Artigo
                    </button>
                    <button
                      onClick={() => handleDeleteBlogPost(post.id)}
                      className="p-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-200 hover:bg-rose-100"
                      title="Excluir Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VISÃO GERAL & COBERTURA */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#5A4035]">Cobertura de Estados no Brasil</h2>
            <div className="space-y-3">
              {BRAZIL_STATES.slice(0, 6).map((st) => (
                <div key={st.uf} className="flex items-center justify-between p-3 bg-[#FAF5F0] rounded-xl text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#5A4035] text-white flex items-center justify-center font-bold">
                      {st.uf}
                    </span>
                    <span>{st.name}</span>
                  </div>
                  <span className="text-[#C88E9B] font-bold">{st.photographersCount} Estúdios</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#5A4035]">Resumo Operacional</h2>
            <div className="space-y-3 text-xs text-[#5A4035]">
              <div className="p-3 bg-[#FAF5F0] rounded-xl flex items-center justify-between">
                <span>Total de Estúdios Cadastrados</span>
                <span className="font-bold text-[#5A4035]">7.840</span>
              </div>
              <div className="p-3 bg-[#FAF5F0] rounded-xl flex items-center justify-between">
                <span>Taxa de Renovação Anual</span>
                <span className="text-emerald-600 font-bold">92.4%</span>
              </div>
              <div className="p-3 bg-[#FAF5F0] rounded-xl flex items-center justify-between">
                <span>Leads Entregues neste mês</span>
                <span className="text-[#C88E9B] font-bold">18.420</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STUDIO PROFILE (ADMIN) */}
      {editingStudio && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#C88E9B]/30">
            <div className="flex items-center justify-between border-b border-[#C88E9B]/20 pb-3">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#5A4035]">Editar Perfil do Estúdio (Admin)</h3>
                <p className="text-xs text-[#5A4035]/70">Alterações salvam diretamente no banco de dados do portal</p>
              </div>
              <button
                onClick={() => setEditingStudio(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-[#5A4035]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudioEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Nome do Estúdio:</label>
                  <input
                    type="text"
                    value={editingStudio.studioName}
                    onChange={(e) => setEditingStudio({ ...editingStudio, studioName: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Nome do Fotógrafo Principal:</label>
                  <input
                    type="text"
                    value={editingStudio.name}
                    onChange={(e) => setEditingStudio({ ...editingStudio, name: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Cidade:</label>
                  <input
                    type="text"
                    value={editingStudio.city}
                    onChange={(e) => setEditingStudio({ ...editingStudio, city: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Estado (UF):</label>
                  <input
                    type="text"
                    value={editingStudio.state}
                    onChange={(e) => setEditingStudio({ ...editingStudio, state: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Preço Inicial (R$):</label>
                  <input
                    type="number"
                    value={editingStudio.priceStartingFrom}
                    onChange={(e) => setEditingStudio({ ...editingStudio, priceStartingFrom: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Plano Atual:</label>
                  <select
                    value={editingStudio.plan}
                    onChange={(e: any) => setEditingStudio({ ...editingStudio, plan: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl font-bold"
                  >
                    <option value="Gratuito">Gratuito</option>
                    <option value="Destaque">Destaque</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Telefone / WhatsApp:</label>
                  <input
                    type="text"
                    value={editingStudio.phone}
                    onChange={(e) => setEditingStudio({ ...editingStudio, phone: e.target.value, whatsapp: e.target.value.replace(/\D/g, '') })}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Bio / Apresentação do Perfil:</label>
                <textarea
                  rows={3}
                  value={editingStudio.bioFull}
                  onChange={(e) => setEditingStudio({ ...editingStudio, bioFull: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-[#C88E9B]/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudio(null)}
                  className="px-5 py-2.5 bg-gray-100 text-[#5A4035] font-bold rounded-xl hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C88E9B] text-white font-bold rounded-xl hover:bg-[#b07885] transition-colors"
                >
                  Salvar Alterações do Estúdio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BLOG POST ADD / EDIT */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#C88E9B]/30">
            <div className="flex items-center justify-between border-b border-[#C88E9B]/20 pb-3">
              <h3 className="text-xl font-serif font-bold text-[#5A4035]">
                {editingBlogPost ? 'Editar Post do Blog' : 'Criar Novo Post no Blog'}
              </h3>
              <button
                onClick={() => setIsBlogModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-[#5A4035]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlogPost} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Título do Artigo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Guia Completo para Fotografia em Casamento no Campo..."
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Categoria:</label>
                  <select
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl font-medium"
                  >
                    <option value="Dicas de Fotografia">Dicas de Fotografia</option>
                    <option value="Orçamento">Orçamento</option>
                    <option value="Ensaios">Ensaios</option>
                    <option value="Tendências de Casamento">Tendências de Casamento</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Autor:</label>
                  <input
                    type="text"
                    value={blogAuthor}
                    onChange={(e) => setBlogAuthor(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">URL da Imagem Capa:</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={blogImage}
                  onChange={(e) => setBlogImage(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Resumo / Excerpt:</label>
                <textarea
                  rows={2}
                  placeholder="Breve resumo que aparece na listagem do blog..."
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Conteúdo Completo (Markdown / Texto):</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Escreva o texto do artigo aqui..."
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-[#C88E9B]/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 text-[#5A4035] font-bold rounded-xl hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C88E9B] text-white font-bold rounded-xl hover:bg-[#b07885] transition-colors"
                >
                  Publicar Artigo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
