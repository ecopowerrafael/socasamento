import React, { useEffect, useState } from 'react';
import { Bell, Download, Share2, X } from 'lucide-react';

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
}

function base64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export const PwaInstallPrompt: React.FC<{ authenticated: boolean }> = ({ authenticated }) => {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [pushState, setPushState] = useState<'idle' | 'loading' | 'enabled' | 'denied' | 'unsupported'>('idle');
  const ios = isIos();
  const standalone = isStandalone();

  useEffect(() => {
    if (localStorage.getItem('gfc_hide_install_prompt') === 'yes' || standalone) return;
    const listener = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', listener);
    if (ios) setVisible(true);
    return () => window.removeEventListener('beforeinstallprompt', listener);
  }, [ios, standalone]);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') setVisible(false);
  };

  const activatePush = async () => {
    if (!authenticated || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setPushState('unsupported');
      return;
    }
    if (ios && !standalone) {
      setVisible(true);
      return;
    }
    setPushState('loading');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setPushState('denied');
      return;
    }
    const status = await fetch('/api/push/status').then((r) => r.json());
    if (!status.publicKey) {
      setPushState('unsupported');
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(status.publicKey),
    });
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        device: {
          browser: navigator.userAgent,
          deviceName: ios ? 'iPhone / iPad' : 'Navegador',
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          isPwa: standalone,
        },
      }),
    });
    setPushState('enabled');
  };

  if (!visible && (!authenticated || pushState === 'enabled')) return null;

  return (
    <aside className="fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-sm z-[70] bg-white border border-[#C88E9B]/30 rounded-2xl shadow-2xl p-5 text-[#5A4035]" aria-live="polite">
      <button onClick={() => setVisible(false)} className="absolute right-3 top-3 p-1 text-[#5A4035]/50" aria-label="Fechar"><X className="w-4 h-4" /></button>
      {!standalone && (
        <>
          <div className="flex gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#C88E9B]/15 flex items-center justify-center"><Download className="w-5 h-5 text-[#C88E9B]" /></span>
            <div><h2 className="font-bold">Instale o Guia Casamento</h2><p className="text-xs text-[#5A4035]/70 mt-1">Acesso rápido, notificações e atalho na tela inicial.</p></div>
          </div>
          {ios ? (
            <div className="mt-4 text-xs bg-[#F6EEE8] rounded-xl p-3 space-y-1">
              <p className="font-bold flex items-center gap-1"><Share2 className="w-4 h-4" /> No iPhone ou iPad</p>
              <p>1. Toque em Compartilhar.</p><p>2. Escolha “Adicionar à Tela de Início”.</p><p>3. Abra pelo novo ícone e ative as notificações.</p>
            </div>
          ) : installEvent ? (
            <button onClick={install} className="mt-4 w-full bg-[#C88E9B] text-white rounded-xl py-2.5 text-sm font-bold">Instalar aplicativo</button>
          ) : null}
        </>
      )}
      {authenticated && (standalone || !ios) && (
        <div className={`${standalone ? '' : 'mt-4 pt-4 border-t border-[#5A4035]/10'}`}>
          <p className="text-xs font-semibold flex gap-2 items-center"><Bell className="w-4 h-4 text-[#C88E9B]" /> Ative notificações de orçamentos, respostas e lembretes.</p>
          <button disabled={pushState === 'loading'} onClick={activatePush} className="mt-3 w-full border border-[#C88E9B] text-[#C88E9B] rounded-xl py-2 text-xs font-bold disabled:opacity-50">
            {pushState === 'loading' ? 'Ativando…' : pushState === 'enabled' ? 'Notificações ativadas' : 'Ativar notificações'}
          </button>
          {pushState === 'denied' && <p className="text-[11px] text-red-600 mt-2">As notificações foram bloqueadas. Reative-as nas configurações do dispositivo.</p>}
          {pushState === 'unsupported' && <p className="text-[11px] text-amber-700 mt-2">Recurso indisponível ou ainda não configurado pelo administrador.</p>}
        </div>
      )}
      {!standalone && <button onClick={() => { localStorage.setItem('gfc_hide_install_prompt', 'yes'); setVisible(false); }} className="mt-3 w-full text-[11px] text-[#5A4035]/60">Não mostrar novamente neste dispositivo</button>}
    </aside>
  );
};
