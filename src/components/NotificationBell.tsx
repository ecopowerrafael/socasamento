import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';

export const NotificationBell: React.FC<{ onOpenAll: () => void }> = ({ onOpenAll }) => {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<any[]>([]);

  const refresh = async () => {
    const [countResponse, listResponse] = await Promise.all([
      fetch('/api/notifications/unread-count'),
      fetch('/api/notifications?limit=6'),
    ]);
    if (countResponse.ok) setCount((await countResponse.json()).count || 0);
    if (listResponse.ok) setItems((await listResponse.json()).notifications || []);
  };

  useEffect(() => {
    refresh().catch(() => {});
    const timer = window.setInterval(() => refresh().catch(() => {}), 60_000);
    return () => clearInterval(timer);
  }, []);

  const markAll = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    setCount(0);
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    if ('clearAppBadge' in navigator) (navigator as any).clearAppBadge().catch(() => {});
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} className="relative p-2 rounded-xl bg-white border border-[#5A4035]/15 text-[#5A4035]" aria-label={`Notificações, ${count} não lidas`}>
        <Bell className="w-4 h-4" />
        {count > 0 && <span className="absolute -right-1 -top-1 min-w-4 h-4 px-1 rounded-full bg-[#C88E9B] text-white text-[9px] font-bold grid place-items-center">{count > 99 ? '99+' : count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-2xl border border-[#C88E9B]/20 shadow-2xl overflow-hidden z-[80]">
          <div className="p-4 flex items-center justify-between border-b border-[#5A4035]/10"><strong className="text-sm">Notificações</strong><button onClick={markAll} className="text-[11px] text-[#C88E9B] flex gap-1"><CheckCheck className="w-4 h-4" /> Marcar todas</button></div>
          <div className="max-h-80 overflow-auto">
            {items.length === 0 ? <p className="p-6 text-xs text-center text-[#5A4035]/60">Nenhuma notificação por aqui.</p> : items.map((item) => (
              <button key={item.id} onClick={async () => { await fetch(`/api/notifications/${item.id}/read`, { method: 'POST' }); setOpen(false); window.location.href = item.actionUrl || '/notificacoes'; }} className={`w-full text-left p-4 border-b border-[#5A4035]/5 ${item.isRead ? 'bg-white' : 'bg-[#F6EEE8]'}`}>
                <span className="text-xs font-bold block">{item.title}</span><span className="text-[11px] text-[#5A4035]/70 line-clamp-2">{item.message}</span>
              </button>
            ))}
          </div>
          <button onClick={() => { setOpen(false); onOpenAll(); }} className="w-full p-3 text-xs font-bold text-[#C88E9B]">Ver central completa</button>
        </div>
      )}
    </div>
  );
};
