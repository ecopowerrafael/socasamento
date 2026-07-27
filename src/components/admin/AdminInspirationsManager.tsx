import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Search, Edit2, Trash2, Heart, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { BrideInspiration } from '../../types';

export const AdminInspirationsManager: React.FC = () => {
  const [inspirations, setInspirations] = useState<BrideInspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BrideInspiration | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'decoração' as 'decoração' | 'vestido' | 'fotografia' | 'maquiagem' | 'bolo',
    imageUrl: '',
    likesCount: 100,
  });

  const fetchInspirations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inspirations');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Não foi possível carregar as inspirações.');
      setInspirations(Array.isArray(data.inspirations) ? data.inspirations : []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MySQL indisponível.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspirations();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'decoração',
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800',
      likesCount: 150,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: BrideInspiration) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      likesCount: item.likesCount || 100,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta inspiração do Pinterest interno?')) return;
    try {
      const response = await fetch(`/api/inspirations/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Não foi possível excluir.');
      await fetchInspirations();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      alert('Por favor preencha o título e a URL da imagem.');
      return;
    }

    if (editingItem) {
      // Update
      const updatedItem: BrideInspiration = {
        ...editingItem,
        title: formData.title,
        category: formData.category,
        imageUrl: formData.imageUrl,
        likesCount: formData.likesCount,
      };
      try {
        const response = await fetch(`/api/inspirations/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem),
        });
        if (!response.ok) throw new Error('Não foi possível atualizar.');
        await fetchInspirations();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao atualizar.');
        return;
      }
    } else {
      // Create
      const newItem: BrideInspiration = {
        id: 'insp-' + Date.now(),
        title: formData.title,
        category: formData.category,
        imageUrl: formData.imageUrl,
        likesCount: formData.likesCount,
        favorited: false,
      };
      try {
        const response = await fetch('/api/inspirations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
        if (!response.ok) throw new Error('Não foi possível criar.');
        await fetchInspirations();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao criar.');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const filtered = inspirations.filter((item) => {
    const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#C88E9B] font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#C7A86A]" />
            <span>Pinterest Interno das Noivas</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#5A4035] mt-1">
            Gerenciador de Inspirações de Casamento
          </h2>
          <p className="text-xs text-stone-500">
            Cadastre referências visuais de decoração, vestido, fotografia, maquiagem e bolo para as noivas favoritarem.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-[#C88E9B] hover:bg-[#b07885] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Inspiração</span>
        </button>
      </div>
      {error && <div className="rounded-xl bg-red-50 text-red-700 p-3 text-xs">{error}</div>}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar inspirações por título..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C88E9B]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {['all', 'decoração', 'vestido', 'fotografia', 'maquiagem', 'bolo'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize shrink-0 ${
                categoryFilter === cat
                  ? 'bg-[#5A4035] text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat === 'all' ? 'Todas Categorias' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="p-12 text-center text-stone-400 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#C88E9B]" />
          <p className="text-xs">Carregando painel de inspirações...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 space-y-2">
          <ImageIcon className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm font-bold">Nenhuma inspiração encontrada</p>
          <p className="text-xs">Tente ajustar seus filtros de busca ou cadastre uma nova foto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                <span className="absolute top-2 left-2 bg-[#5A4035]/90 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  {item.category}
                </span>

                <div className="absolute bottom-2 right-2 bg-white/90 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>{item.likesCount || 0}</span>
                </div>
              </div>

              <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                <h3 className="text-xs font-bold text-[#5A4035] line-clamp-2">
                  {item.title}
                </h3>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 text-stone-500 hover:text-[#5A4035] hover:bg-stone-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-serif font-bold text-[#5A4035]">
                {editingItem ? 'Editar Inspiração' : 'Nova Inspiração para Noivas'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Título da Inspiração</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Buquê com Rosas Nude e Eucalipto"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C88E9B]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C88E9B]"
                >
                  <option value="decoração">Decoração</option>
                  <option value="vestido">Vestido</option>
                  <option value="fotografia">Fotografia</option>
                  <option value="maquiagem">Maquiagem</option>
                  <option value="bolo">Bolo</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">URL da Imagem (Unsplash ou Direto)</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C88E9B]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Contagem Inicial de Salvamentos / Curtidas</label>
                <input
                  type="number"
                  min="0"
                  value={formData.likesCount}
                  onChange={(e) => setFormData({ ...formData, likesCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C88E9B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C88E9B] hover:bg-[#b07885] text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Inspiração</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
