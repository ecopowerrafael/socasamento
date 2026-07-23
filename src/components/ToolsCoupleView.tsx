import React, { useState } from 'react';
import { Sparkles, Calculator, CheckSquare, MessageSquare, Bot, ArrowRight, ShieldCheck } from 'lucide-react';
import { INITIAL_CHECKLIST } from '../data/mockData';
import { ChecklistItem } from '../types';

interface ToolsCoupleViewProps {
  openMultiQuote: () => void;
}

export const ToolsCoupleView: React.FC<ToolsCoupleViewProps> = ({ openMultiQuote }) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'checklist' | 'ai'>('calculator');

  // Calculator State
  const [totalBudget, setTotalBudget] = useState<number>(40000);
  const [guestCount, setGuestCount] = useState<number>(120);
  const [wantsVideo, setWantsVideo] = useState<boolean>(true);
  const [wantsDrone, setWantsDrone] = useState<boolean>(true);
  const [wantsAlbum, setWantsAlbum] = useState<boolean>(true);
  const [wantsPreWedding, setWantsPreWedding] = useState<boolean>(true);

  // Calculated estimates
  const estimatedPhotoBudgetMin = Math.round(totalBudget * 0.10);
  const estimatedPhotoBudgetMax = Math.round(totalBudget * 0.16);

  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCity, setAiCity] = useState('Piracicaba');
  const [aiStyle, setAiStyle] = useState('Fine Art');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: aiPrompt,
          city: aiCity,
          style: aiStyle,
          budget: estimatedPhotoBudgetMax,
          guestCount
        })
      });

      const data = await res.json();
      setAiLoading(false);
      if (data.advice) {
        setAiResponse(data.advice);
      }
    } catch (err) {
      setAiLoading(false);
      setAiResponse(
        `✨ **Dica Inteligente NoivaBot:** Para um orçamento de R$ ${estimatedPhotoBudgetMax.toLocaleString('pt-BR')} em ${aiCity}, o estilo **${aiStyle}** é perfeito para coberturas com foto, álbum de linho e pré-wedding ao ar livre!`
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#C88E9B]/20 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF5F0] rounded-full text-xs font-semibold text-[#5A4035] border border-[#C88E9B]/30 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C7A86A]" />
          <span>Área Exclusiva dos Noivos</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A4035]">
          Ferramentas de Planejamento de Fotografia
        </h1>
        <p className="text-xs text-[#5A4035]/80">
          Simule custos, organize a lista de tarefas e receba orientação com inteligência artificial
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#5A4035]/10 pb-1">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'calculator'
              ? 'bg-[#C88E9B] text-white shadow-sm'
              : 'bg-white text-[#5A4035] hover:bg-[#FAF5F0]'
          }`}
        >
          <Calculator className="w-4 h-4 text-[#C7A86A]" />
          <span>Calculadora de Custos</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'checklist'
              ? 'bg-[#C88E9B] text-white shadow-sm'
              : 'bg-white text-[#5A4035] hover:bg-[#FAF5F0]'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-[#C7A86A]" />
          <span>Checklist da Noiva</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'ai'
              ? 'bg-[#C88E9B] text-white shadow-sm'
              : 'bg-white text-[#5A4035] hover:bg-[#FAF5F0]'
          }`}
        >
          <Bot className="w-4 h-4 text-[#C7A86A]" />
          <span>Consultora AI NoivaBot</span>
        </button>
      </div>

      {/* Tab 1: Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#5A4035]">Simulador de Gastos com Fotografia & Filme</h2>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Orçamento Total do Casamento (R$):</label>
                <input
                  type="number"
                  step={5000}
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full p-3 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl text-sm font-bold text-[#5A4035]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Número de Convidados:</label>
                <input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full p-3 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl text-sm font-bold text-[#5A4035]"
                />
              </div>

              <div className="pt-2">
                <label className="block font-bold text-[#5A4035] mb-2">Serviços Adicionais Inclusos:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-2 p-3 bg-[#FAF5F0] rounded-xl cursor-pointer">
                    <input type="checkbox" checked={wantsVideo} onChange={(e) => setWantsVideo(e.target.checked)} className="rounded text-[#C88E9B]" />
                    <span>Vídeo / Filme</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-[#FAF5F0] rounded-xl cursor-pointer">
                    <input type="checkbox" checked={wantsDrone} onChange={(e) => setWantsDrone(e.target.checked)} className="rounded text-[#C88E9B]" />
                    <span>Drone 4K</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-[#FAF5F0] rounded-xl cursor-pointer">
                    <input type="checkbox" checked={wantsAlbum} onChange={(e) => setWantsAlbum(e.target.checked)} className="rounded text-[#C88E9B]" />
                    <span>Álbum Impresso</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-[#FAF5F0] rounded-xl cursor-pointer">
                    <input type="checkbox" checked={wantsPreWedding} onChange={(e) => setWantsPreWedding(e.target.checked)} className="rounded text-[#C88E9B]" />
                    <span>Pré-Wedding</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#5A4035] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C7A86A]">Recomendação Técnica do Portal</span>
              <h3 className="text-2xl font-serif font-bold">Investimento Ideal em Fotografia</h3>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/15">
                <span className="text-xs text-white/80 block">Faixa Recomendada (10% a 16% do orçamento total)</span>
                <span className="text-3xl font-serif font-bold text-[#C7A86A]">
                  R$ {estimatedPhotoBudgetMin.toLocaleString('pt-BR')} - R$ {estimatedPhotoBudgetMax.toLocaleString('pt-BR')}
                </span>
              </div>

              <p className="text-xs text-white/80 leading-relaxed">
                Essa faixa permite contratar equipe completa com cobertura de making of, cerimônia, festa e álbum encadernado em linho ou couro.
              </p>
            </div>

            <button
              onClick={openMultiQuote}
              className="w-full py-3.5 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#C7A86A]" />
              <span>Cotar Fotógrafos com Esse Perfil</span>
            </button>
          </div>

        </div>
      )}

      {/* Tab 2: Checklist */}
      {activeTab === 'checklist' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#C88E9B]/20 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#5A4035]">Checklist de Fotografia e Filme de Casamento</h2>
              <p className="text-xs text-[#5A4035]/70">Marque as etapas conforme avança nos preparativos</p>
            </div>
            <span className="text-xs font-bold text-[#C88E9B]">
              {checklist.filter((i) => i.completed).length} de {checklist.length} concluídas
            </span>
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.completed
                    ? 'bg-[#FAF5F0] border-[#C88E9B]/40 opacity-75'
                    : 'bg-white border-[#5A4035]/15 hover:border-[#C88E9B]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                  className="mt-1 rounded text-[#C88E9B] w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${item.completed ? 'line-through text-[#5A4035]/60' : 'text-[#5A4035]'}`}>
                      {item.task}
                    </span>
                    <span className="text-[10px] font-semibold text-[#C88E9B] bg-[#F6EEE8] px-2 py-0.5 rounded-full">
                      {item.timeframe}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI Assistant */}
      {activeTab === 'ai' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C88E9B]/20 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#5A4035] text-[#C7A86A] flex items-center justify-center">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#5A4035]">Consultora Inteligente NoivaBot (AI)</h2>
              <p className="text-xs text-[#5A4035]/70">Pergunte qualquer dúvida sobre orçamento, estilos e escolha de fotógrafo</p>
            </div>
          </div>

          <form onSubmit={handleAskAI} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Cidade do Casamento:</label>
                <input
                  type="text"
                  value={aiCity}
                  onChange={(e) => setAiCity(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Estilo Favorito:</label>
                <select
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl font-semibold"
                >
                  <option value="Fine Art">Fine Art (Luz natural e poético)</option>
                  <option value="Boho">Boho / Campo / Terroso</option>
                  <option value="Documental">Fotojornalismo / Espontâneo</option>
                  <option value="Editorial">Editorial / Alta Moda</option>
                  <option value="Clássico">Clássico / Tradicional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#5A4035] mb-1">Sua Pergunta / Desejo de Casamento:</label>
              <textarea
                rows={3}
                placeholder="Ex: Quero um mini wedding na praia de Ilhabela para 80 pessoas. Qual o orçamento médio e o que devo prestar atenção?"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl text-xs"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={aiLoading}
              className="px-6 py-3 bg-[#5A4035] hover:bg-[#C88E9B] text-white font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#C7A86A]" />
              <span>{aiLoading ? 'Analisando com Inteligência Artificial...' : 'Consultar NoivaBot AI'}</span>
            </button>
          </form>

          {aiResponse && (
            <div className="bg-[#FAF5F0] p-6 rounded-2xl border border-[#C88E9B]/30 space-y-3">
              <h3 className="font-serif font-bold text-base text-[#5A4035] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C7A86A]" />
                <span>Resposta da Consultora NoivaBot:</span>
              </h3>
              <div className="text-xs text-[#5A4035] whitespace-pre-line leading-relaxed">
                {aiResponse}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
