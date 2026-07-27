import React, { useEffect, useState } from 'react';
import { BlogArticle } from '../types';
import { FileText, Clock, User, ArrowLeft, Sparkles, Share2 } from 'lucide-react';

interface BlogViewProps {
  openMultiQuote: () => void;
}

export const BlogView: React.FC<BlogViewProps> = ({ openMultiQuote }) => {
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(null);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/blog')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Não foi possível carregar o blog.');
        setArticles((data.articles || []).map((article: any) => ({ ...article, id: String(article.id) })));
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  if (activeArticle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <button
          onClick={() => setActiveArticle(null)}
          className="text-xs font-semibold text-[#C88E9B] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Todos os Artigos do Blog</span>
        </button>

        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C88E9B]/20 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#C88E9B] uppercase tracking-wider">{activeArticle.category}</span>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#5A4035] leading-tight">{activeArticle.title}</h1>
            <div className="flex items-center gap-4 text-xs text-[#5A4035]/70 pt-2 border-t border-[#5A4035]/10">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {activeArticle.author}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activeArticle.readTime}</span>
              <span>{activeArticle.date}</span>
            </div>
          </div>

          <img
            src={activeArticle.image}
            alt={activeArticle.title}
            className="w-full h-80 object-cover rounded-2xl shadow-sm"
          />

          <div className="text-sm text-[#5A4035]/90 leading-relaxed space-y-4 whitespace-pre-line font-normal">
            {activeArticle.content}
          </div>

          {/* Banner CTA inside post */}
          <div className="bg-[#FAF5F0] p-6 rounded-2xl border border-[#C88E9B]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#5A4035]">Procurando fotógrafo para seu casamento?</h3>
              <p className="text-xs text-[#5A4035]/80">Compare orçamentos de estúdios verificados na sua cidade.</p>
            </div>
            <button
              onClick={openMultiQuote}
              className="px-5 py-2.5 bg-[#C88E9B] text-white font-bold text-xs rounded-xl hover:bg-[#b07885] transition-colors shrink-0"
            >
              Solicitar Orçamento Grátis
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#C88E9B]/20 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF5F0] rounded-full text-xs font-semibold text-[#5A4035] border border-[#C88E9B]/30 mb-2">
          <FileText className="w-3.5 h-3.5 text-[#C7A86A]" />
          <span>Blog SEO de Fotografia de Casamento</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A4035]">
          Artigos e Dicas Especializadas para Noivos
        </h1>
        <p className="text-xs text-[#5A4035]/80">
          Tudo o que você precisa saber sobre orçamentos, contratos, estilos de fotos e dicas para o grande dia
        </p>
      </div>

      {loading ? <p className="text-sm">Carregando artigos do MySQL…</p> : error ? (
        <p className="rounded-2xl bg-red-50 text-red-700 p-5 text-sm">{error}</p>
      ) : articles.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-sm text-center">Nenhum artigo publicado.</p>
      ) : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            onClick={() => setActiveArticle(art)}
            className="bg-white rounded-3xl overflow-hidden border border-[#C88E9B]/20 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-48 overflow-hidden relative">
                <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 bg-[#5A4035] text-[#C7A86A] text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {art.category}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-serif font-bold text-base text-[#5A4035] group-hover:text-[#C88E9B] transition-colors leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-[#5A4035]/80 line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-[#5A4035]/10 flex items-center justify-between text-xs text-[#5A4035]/70">
              <span>{art.date}</span>
              <span className="font-bold text-[#C88E9B]">Ler artigo →</span>
            </div>
          </div>
        ))}
      </div>}

    </div>
  );
};
