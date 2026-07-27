import React, { useEffect, useState } from 'react';
import { Archive, Bell, CheckCheck, Trash2 } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => fetch('/api/notifications?limit=100').then((r) => r.json()).then((data) => setItems(data.notifications || [])).finally(() => setLoading(false));
  useEffect(() => { load().catch(() => setLoading(false)); }, []);
  const action = async (id: number, kind: 'read' | 'archive' | 'delete') => {
    await fetch(`/api/notifications/${id}${kind === 'delete' ? '' : `/${kind}`}`, { method: kind === 'delete' ? 'DELETE' : 'POST' });
    await load();
  };
  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-3xl font-serif font-bold">Suas notificações</h1><p className="text-sm text-[#5A4035]/65">Orçamentos, mensagens, agenda e avisos importantes.</p></div><Bell className="w-8 h-8 text-[#C88E9B]" /></div>
      {loading ? <p className="text-sm">Carregando…</p> : items.length === 0 ? <div className="bg-white rounded-2xl p-10 text-center border border-[#C88E9B]/20"><p className="font-bold">Tudo em dia</p><p className="text-xs text-[#5A4035]/60 mt-1">Novos avisos aparecerão aqui.</p></div> : (
        <div className="space-y-3">{items.map((item) => <article key={item.id} className={`rounded-2xl border p-5 ${item.isRead ? 'bg-white border-[#5A4035]/10' : 'bg-[#FFF9F5] border-[#C88E9B]/40'}`}>
          <div className="flex gap-4 justify-between"><button onClick={() => { action(item.id, 'read'); if (item.actionUrl) window.location.href = item.actionUrl; }} className="text-left flex-1"><span className="text-[10px] uppercase tracking-wider text-[#C88E9B] font-bold">{item.category}</span><h2 className="font-bold">{item.title}</h2><p className="text-sm text-[#5A4035]/70 mt-1">{item.message}</p><time className="text-[10px] text-[#5A4035]/45 mt-2 block">{new Date(item.createdAt).toLocaleString('pt-BR')}</time></button>
          <div className="flex gap-1"><button onClick={() => action(item.id, 'read')} className="p-2" aria-label="Marcar como lida"><CheckCheck className="w-4 h-4" /></button><button onClick={() => action(item.id, 'archive')} className="p-2" aria-label="Arquivar"><Archive className="w-4 h-4" /></button><button onClick={() => action(item.id, 'delete')} className="p-2 text-red-600" aria-label="Excluir"><Trash2 className="w-4 h-4" /></button></div></div>
        </article>)}</div>
      )}
    </section>
  );
};
