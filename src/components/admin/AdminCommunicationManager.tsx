import React, { useEffect, useState } from 'react';
import { BellRing, KeyRound, Mail, Send, Settings, Smartphone } from 'lucide-react';

const Field = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <label className="block text-xs font-bold text-[#5A4035]">{label}<input {...props} className="mt-1 w-full rounded-xl border border-[#5A4035]/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#C88E9B]" /></label>
);

export const AdminCommunicationManager: React.FC = () => {
  const [tab, setTab] = useState<'push' | 'send' | 'smtp' | 'stats'>('push');
  const [message, setMessage] = useState('');
  const [push, setPush] = useState<any>({ isEnabled: false, vapidSubject: 'mailto:contato@dominio.com.br', defaultIconUrl: '/icons/icon-192.png', defaultBadgeUrl: '/icons/badge-96.png', defaultClickUrl: '/notificacoes', quietHoursStart: '22:00', quietHoursEnd: '08:00', timezone: 'America/Sao_Paulo' });
  const [smtp, setSmtp] = useState<any>({ isEnabled: false, port: 587, secureMode: 'STARTTLS', fromName: 'Guia Fotógrafo Casamento', rateLimitPerMinute: 60, rateLimitPerHour: 1000 });
  const [campaign, setCampaign] = useState<any>({ targetType: 'ALL', priority: 'NORMAL', actionUrl: '/notificacoes' });
  const [stats, setStats] = useState<any>({});
  const api = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir.');
    return data;
  };
  useEffect(() => {
    Promise.all([
      api('/api/admin/push/settings').then((d) => d.settings && setPush((p: any) => ({ ...p, ...d.settings }))),
      api('/api/admin/smtp/settings').then((d) => d.settings && setSmtp((p: any) => ({ ...p, ...d.settings }))),
      api('/api/admin/push/statistics').then((d) => setStats(d.statistics || {})),
    ]).catch((error) => setMessage(error.message));
  }, []);
  const savePush = async () => { await api('/api/admin/push/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(push) }); setMessage('Configurações de Web Push salvas.'); };
  const generateKeys = async () => { if (push.privateKeyConfigured && !confirm('Substituir as chaves pode invalidar inscrições atuais. Deseja continuar?')) return; const data = await api('/api/admin/push/generate-vapid-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject: push.vapidSubject }) }); setPush((p: any) => ({ ...p, vapidPublicKey: data.publicKey, privateKeyConfigured: true })); setMessage('Chaves VAPID geradas e a chave privada foi protegida.'); };
  const saveSmtp = async () => { await api('/api/admin/smtp/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(smtp) }); setMessage('Configurações SMTP salvas com segurança.'); };
  const verifySmtp = async () => { const data = await api('/api/admin/smtp/verify', { method: 'POST' }); setMessage(data.message); };
  const createCampaign = async () => { const data = await api('/api/admin/push/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...campaign, name: campaign.title }) }); if (campaign.sendNow) { const sent = await api(`/api/admin/push/campaigns/${data.id}/send`, { method: 'POST' }); setMessage(`Campanha registrada para ${sent.recipients} usuários.`); } else setMessage('Campanha salva como rascunho.'); };
  const tabs = [
    ['push', 'Configuração Push', Settings],
    ['send', 'Enviar Push', Send],
    ['smtp', 'E-mails SMTP', Mail],
    ['stats', 'Estatísticas', BellRing],
  ] as const;
  return (
    <section className="bg-white rounded-3xl border border-[#C88E9B]/20 shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8 bg-[#5A4035] text-white"><h2 className="text-2xl font-serif font-bold">Comunicação</h2><p className="text-xs text-white/70">Push, e-mails, automações, dispositivos e histórico em um só lugar.</p></div>
      <div className="flex flex-wrap gap-2 p-4 border-b border-[#5A4035]/10">{tabs.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-xl text-xs font-bold flex gap-2 items-center ${tab === id ? 'bg-[#C88E9B] text-white' : 'bg-[#F6EEE8]'}`}><Icon className="w-4 h-4" />{label}</button>)}</div>
      {message && <div className="mx-6 mt-5 p-3 rounded-xl bg-[#F6EEE8] text-xs font-semibold">{message}</div>}
      <div className="p-6 sm:p-8">
        {tab === 'push' && <div className="space-y-5">
          <div className="flex items-center justify-between"><div><h3 className="font-bold">Web Push padrão com VAPID</h3><p className="text-xs text-[#5A4035]/60">Sem Firebase. A chave privada nunca é exibida.</p></div><label className="flex gap-2 text-xs font-bold"><input type="checkbox" checked={Boolean(push.isEnabled)} onChange={(e) => setPush({ ...push, isEnabled: e.target.checked })} /> Ativo</label></div>
          <div className="grid md:grid-cols-2 gap-4"><Field label="VAPID Subject" value={push.vapidSubject || ''} onChange={(e) => setPush({ ...push, vapidSubject: e.target.value })} /><Field label="Chave pública VAPID" readOnly value={push.vapidPublicKey || 'Ainda não gerada'} /><Field label="Ícone padrão" value={push.defaultIconUrl || ''} onChange={(e) => setPush({ ...push, defaultIconUrl: e.target.value })} /><Field label="URL padrão" value={push.defaultClickUrl || ''} onChange={(e) => setPush({ ...push, defaultClickUrl: e.target.value })} /></div>
          <div className="rounded-xl bg-[#F6EEE8] p-4 flex items-center gap-3"><KeyRound className="w-5 h-5 text-[#C88E9B]" /><span className="text-xs"><strong>Chave privada:</strong> {push.privateKeyConfigured ? 'configurada e protegida' : 'não configurada'}</span></div>
          <div className="flex flex-wrap gap-2"><button onClick={generateKeys} className="px-4 py-2 rounded-xl border border-[#C88E9B] text-[#C88E9B] text-xs font-bold">{push.privateKeyConfigured ? 'Substituir chaves' : 'Gerar chaves VAPID'}</button><button onClick={savePush} className="px-4 py-2 rounded-xl bg-[#C88E9B] text-white text-xs font-bold">Salvar configuração</button></div>
        </div>}
        {tab === 'send' && <div className="space-y-4"><h3 className="font-bold">Nova campanha</h3><div className="grid md:grid-cols-2 gap-4"><Field label="Título" maxLength={120} value={campaign.title || ''} onChange={(e) => setCampaign({ ...campaign, title: e.target.value })} /><label className="text-xs font-bold">Público<select value={campaign.targetType} onChange={(e) => setCampaign({ ...campaign, targetType: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5 bg-white"><option value="ALL">Todos os usuários</option><option value="PHOTOGRAPHERS">Fotógrafos</option><option value="BRIDES">Noivas</option><option value="ADMINS">Administradores</option></select></label></div><label className="block text-xs font-bold">Mensagem<textarea maxLength={2000} value={campaign.message || ''} onChange={(e) => setCampaign({ ...campaign, message: e.target.value })} className="mt-1 w-full min-h-28 rounded-xl border p-3 font-normal" /></label><Field label="URL interna de abertura" value={campaign.actionUrl || ''} onChange={(e) => setCampaign({ ...campaign, actionUrl: e.target.value })} /><label className="flex gap-2 text-xs font-bold"><input type="checkbox" checked={Boolean(campaign.sendNow)} onChange={(e) => setCampaign({ ...campaign, sendNow: e.target.checked })} /> Enviar agora após salvar</label><button disabled={!campaign.title || !campaign.message} onClick={createCampaign} className="px-5 py-2.5 rounded-xl bg-[#C88E9B] text-white text-xs font-bold disabled:opacity-40">Salvar campanha</button></div>}
        {tab === 'smtp' && <div className="space-y-5"><div className="flex justify-between"><div><h3 className="font-bold">Servidor SMTP da hospedagem</h3><p className="text-xs text-[#5A4035]/60">Usuário e senha são criptografados no MySQL.</p></div><label className="flex gap-2 text-xs font-bold"><input type="checkbox" checked={Boolean(smtp.isEnabled)} onChange={(e) => setSmtp({ ...smtp, isEnabled: e.target.checked })} /> Ativo</label></div><div className="grid md:grid-cols-2 gap-4"><Field label="Host" value={smtp.host || ''} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} /><Field label="Porta" type="number" value={smtp.port || 587} onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })} /><Field label="Usuário SMTP" placeholder={smtp.usernameConfigured ? 'Configurado — deixe vazio para manter' : ''} value={smtp.username || ''} onChange={(e) => setSmtp({ ...smtp, username: e.target.value })} /><Field label="Senha SMTP" type="password" placeholder={smtp.passwordConfigured ? 'Configurada — deixe vazio para manter' : ''} value={smtp.password || ''} onChange={(e) => setSmtp({ ...smtp, password: e.target.value })} /><Field label="Nome do remetente" value={smtp.fromName || ''} onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })} /><Field label="E-mail do remetente" type="email" value={smtp.fromEmail || ''} onChange={(e) => setSmtp({ ...smtp, fromEmail: e.target.value })} /></div><div className="flex gap-2"><button onClick={saveSmtp} className="px-4 py-2 bg-[#C88E9B] text-white rounded-xl text-xs font-bold">Salvar SMTP</button><button onClick={verifySmtp} className="px-4 py-2 border border-[#C88E9B] text-[#C88E9B] rounded-xl text-xs font-bold">Testar conexão</button></div></div>}
        {tab === 'stats' && <div className="grid sm:grid-cols-3 gap-4">{[['Dispositivos ativos', stats.activeDevices || 0, Smartphone], ['Na fila', stats.queued || 0, Send], ['Não lidas', stats.unread || 0, BellRing]].map(([label, value, Icon]: any) => <div key={label} className="rounded-2xl bg-[#F6EEE8] p-5"><Icon className="w-5 h-5 text-[#C88E9B]" /><span className="block text-3xl font-serif font-bold mt-3">{value}</span><span className="text-xs text-[#5A4035]/60">{label}</span></div>)}</div>}
      </div>
    </section>
  );
};
