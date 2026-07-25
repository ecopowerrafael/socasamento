import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Home,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  Sparkles,
  Camera,
  Video,
  Aperture,
  Heart,
  Users,
  Globe,
  FileText,
  Church,
  Layers,
} from 'lucide-react';
import { CategoryItem } from '../../types';

export const AdminCategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete Alert Modal
  const [deleteAlert, setDeleteAlert] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    icon: 'Camera',
    image: '',
    iconColor: '#C88E9B',
    sortOrder: 0,
    showOnHome: true,
    showOnSearch: true,
    status: 'active' as 'active' | 'inactive',
    seoTitle: '',
    seoDescription: '',
    focusKeyword: '',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        page: String(page),
        limit: '10',
      });
      const res = await fetch(`/api/admin/categories?${query}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching admin categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, statusFilter, page]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      icon: 'Camera',
      image: '',
      iconColor: '#C88E9B',
      sortOrder: (categories.length + 1) * 10,
      showOnHome: false,
      showOnSearch: true,
      status: 'active',
      seoTitle: '',
      seoDescription: '',
      focusKeyword: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      shortDescription: cat.shortDescription || '',
      description: cat.description || '',
      icon: cat.icon || 'Camera',
      image: cat.image || '',
      iconColor: cat.iconColor || '#C88E9B',
      sortOrder: cat.sortOrder || 0,
      showOnHome: cat.showOnHome,
      showOnSearch: cat.showOnSearch,
      status: cat.status,
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || '',
      focusKeyword: cat.focusKeyword || '',
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    const autoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-');

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: editingCategory ? prev.slug : autoSlug,
      seoTitle: prev.seoTitle || (val ? `${val} para Casamento | Guia Fotógrafo` : ''),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        alert(data.error || 'Erro ao salvar categoria');
      }
    } catch (err: any) {
      alert('Erro de conexão ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cat: CategoryItem) => {
    const newStatus = cat.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      }
    } catch (err) {
      console.error('Error toggling category status:', err);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (!confirm(`Deseja realmente excluir a categoria "${cat.name}"?`)) return;

    setDeletingId(cat.id);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setDeleteAlert(
          data.error ||
            'Esta categoria possui fotógrafos vinculados. Selecione uma categoria substituta ou remova os vínculos antes de excluir.'
        );
      } else {
        fetchCategories();
      }
    } catch (err: any) {
      setDeleteAlert('Erro de conexão ao tentar excluir a categoria.');
    } finally {
      setDeletingId(null);
    }
  };

  const iconOptions = [
    { label: 'Câmera', value: 'Camera' },
    { label: 'Vídeo', value: 'Video' },
    { label: 'Aperture/Drone', value: 'Aperture' },
    { label: 'Coração/Noivas', value: 'Heart' },
    { label: 'Brilhos', value: 'Sparkles' },
    { label: 'Usuários/Pessoas', value: 'Users' },
    { label: 'Globo/Destination', value: 'Globe' },
    { label: 'Documento/Civil', value: 'FileText' },
    { label: 'Igreja/Religioso', value: 'Church' },
    { label: 'Camadas', value: 'Layers' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#C88E9B]/20 shadow-xs">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#5A4035] flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#C88E9B]" />
            <span>Gerenciamento de Categorias de Serviços</span>
          </h2>
          <p className="text-xs text-[#5A4035]/70 mt-1">
            Cadastre e organize as categorias de fotógrafos exibidas nas buscas e na página inicial
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-[#5A4035] hover:bg-[#4A332A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#C7A86A]" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Delete Alert Modal */}
      {deleteAlert && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-red-800 font-medium">
            <p className="font-bold text-sm text-red-900 mb-1">Não foi possível excluir a categoria</p>
            <p>{deleteAlert}</p>
          </div>
          <button
            onClick={() => setDeleteAlert(null)}
            className="text-red-500 hover:text-red-700 text-xs font-bold underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#C88E9B]/20 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#5A4035]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome da categoria..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF5F0] rounded-xl text-xs font-medium text-[#5A4035] focus:outline-none focus:ring-2 focus:ring-[#C88E9B]/50 border border-transparent"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-[#5A4035]/70">Status:</span>
          <select
            value={statusFilter}
            onChange={(e: any) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[#FAF5F0] rounded-xl text-xs font-bold text-[#5A4035] border border-[#C88E9B]/20 focus:outline-none"
          >
            <option value="all">Todos ({totalCount})</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-[#C88E9B]/20 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-[#5A4035]">
            <Loader2 className="w-5 h-5 animate-spin text-[#C88E9B]" />
            <span className="text-xs font-semibold">Carregando categorias do banco de dados...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-[#5A4035]/60 text-xs">
            Nenhuma categoria encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF5F0] border-b border-[#C88E9B]/20 text-[11px] font-bold text-[#5A4035] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ícone/Cor</th>
                  <th className="py-3.5 px-4">Nome da Categoria</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4 text-center">Fotógrafos</th>
                  <th className="py-3.5 px-4 text-center">Home</th>
                  <th className="py-3.5 px-4 text-center">Ordem</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C88E9B]/10 text-xs">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#FAF5F0]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs"
                        style={{ backgroundColor: cat.iconColor || '#C88E9B' }}
                      >
                        <Tag className="w-4 h-4" />
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-[#5A4035]">
                      <div>{cat.name}</div>
                      {cat.shortDescription && (
                        <div className="text-[10px] text-[#5A4035]/60 font-normal line-clamp-1">
                          {cat.shortDescription}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#5A4035]/70">
                      /{cat.slug}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 bg-[#FAF5F0] rounded-full text-xs font-bold text-[#5A4035] border border-[#5A4035]/10">
                        {cat.photographersCount || 0}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {cat.showOnHome ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Home className="w-3 h-3 text-amber-600" />
                          Home
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-semibold text-[#5A4035]">
                      {cat.sortOrder}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          cat.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {cat.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-gray-400" />
                            Inativo
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-1.5 text-[#5A4035] hover:bg-[#FAF5F0] rounded-lg transition-colors inline-block"
                        title="Editar Categoria"
                      >
                        <Edit2 className="w-4 h-4 text-[#C7A86A]" />
                      </button>

                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deletingId === cat.id}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block disabled:opacity-50"
                        title="Excluir Categoria"
                      >
                        {deletingId === cat.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-[#FAF5F0] border-t border-[#C88E9B]/20 flex items-center justify-between text-xs">
            <span className="text-[#5A4035]/70 font-medium">
              Página {page} de {totalPages} ({totalCount} registros)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 bg-white border border-[#C88E9B]/30 rounded-lg font-bold text-[#5A4035] disabled:opacity-50 hover:bg-[#FAF5F0]"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 bg-white border border-[#C88E9B]/30 rounded-lg font-bold text-[#5A4035] disabled:opacity-50 hover:bg-[#FAF5F0]"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-[#C88E9B]/30 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#C88E9B]/20 pb-4">
              <h3 className="text-lg font-serif font-bold text-[#5A4035] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#C88E9B]" />
                <span>{editingCategory ? 'Editar Categoria' : 'Nova Categoria de Serviço'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#5A4035]/60 hover:text-[#5A4035] hover:bg-[#FAF5F0] rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">
                    Nome da Categoria <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Fotógrafos, Drone, Pré-wedding"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 text-[#5A4035] font-semibold focus:outline-none focus:ring-2 focus:ring-[#C88E9B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">
                    Slug na URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: pre-wedding"
                    value={formData.slug}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 text-[#5A4035] font-mono focus:outline-none focus:ring-2 focus:ring-[#C88E9B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Descrição Curta</label>
                <input
                  type="text"
                  placeholder="Resumo em 1 frase para cartões e listagens"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData((p) => ({ ...p, shortDescription: e.target.value }))}
                  className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 text-[#5A4035]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Ícone Visual</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 text-[#5A4035] font-bold"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Cor do Ícone (Hex)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.iconColor}
                      onChange={(e) => setFormData((p) => ({ ...p, iconColor: e.target.value }))}
                      className="w-9 h-9 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <input
                      type="text"
                      value={formData.iconColor}
                      onChange={(e) => setFormData((p) => ({ ...p, iconColor: e.target.value }))}
                      className="flex-1 p-2 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 text-[#5A4035] font-mono text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 text-[#5A4035] font-bold"
                  />
                </div>
              </div>

              {/* Toggles & Status */}
              <div className="bg-[#FAF5F0] p-4 rounded-2xl space-y-3 border border-[#C88E9B]/20">
                <p className="font-bold text-[#5A4035] uppercase text-[10px] tracking-wider">
                  Visibilidade & Status
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-[#5A4035]">
                    <input
                      type="checkbox"
                      checked={formData.showOnHome}
                      onChange={(e) => setFormData((p) => ({ ...p, showOnHome: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#C88E9B] focus:ring-[#C88E9B]"
                    />
                    <span>Exibir na Home</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-[#5A4035]">
                    <input
                      type="checkbox"
                      checked={formData.showOnSearch}
                      onChange={(e) => setFormData((p) => ({ ...p, showOnSearch: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#C88E9B] focus:ring-[#C88E9B]"
                    />
                    <span>Exibir na Busca</span>
                  </label>

                  <div>
                    <select
                      value={formData.status}
                      onChange={(e: any) => setFormData((p) => ({ ...p, status: e.target.value }))}
                      className="w-full p-2 bg-white rounded-xl border border-[#C88E9B]/30 font-bold text-[#5A4035]"
                    >
                      <option value="active">Status: Ativo</option>
                      <option value="inactive">Status: Inativo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEO Group */}
              <div className="space-y-3 pt-2">
                <h4 className="font-serif font-bold text-sm text-[#5A4035] border-b border-[#C88E9B]/20 pb-1">
                  Otimização de Motores de Busca (SEO)
                </h4>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Título SEO</label>
                  <input
                    type="text"
                    placeholder="Ex: Fotógrafos de Casamento em São Paulo | Guia Especializado"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData((p) => ({ ...p, seoTitle: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 text-[#5A4035]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Meta Descrição</label>
                  <textarea
                    rows={2}
                    placeholder="Descrição para aparecer nos resultados do Google (até 160 caracteres)"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData((p) => ({ ...p, seoDescription: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 text-[#5A4035]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Palavra-chave Principal</label>
                  <input
                    type="text"
                    placeholder="Ex: fotografos casamento, fotos de casamento"
                    value={formData.focusKeyword}
                    onChange={(e) => setFormData((p) => ({ ...p, focusKeyword: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/30 text-[#5A4035]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C88E9B]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-[#FAF5F0] hover:bg-[#F6EEE8] text-[#5A4035] font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#5A4035] hover:bg-[#4A332A] text-white font-bold rounded-xl flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin text-[#C7A86A]" />}
                  <span>{editingCategory ? 'Salvar Alterações' : 'Cadastrar Categoria'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
