import React from 'react';
import { Camera, MapPin, Heart, ShieldCheck, Instagram, Facebook, Mail, Phone, Globe } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
  onSelectCity: (city: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView, onSelectCity }) => {
  return (
    <footer className="bg-[#5A4035] text-[#F6EEE8] pt-14 pb-8 border-t-4 border-[#C88E9B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div 
              onClick={() => setCurrentView('home')}
              className="cursor-pointer inline-block bg-white p-2 rounded-xl shadow-xs"
            >
              <img 
                src="https://loteria.rafaelaugusto.shop/wp-content/uploads/2026/07/ChatGPT-Image-23-de-jul.-de-2026-13_34_25.png" 
                alt="Guia Fotógrafo Casamento" 
                referrerPolicy="no-referrer"
                className="h-10 w-auto object-contain"
              />
            </div>

            <p className="text-xs text-[#F6EEE8]/80 leading-relaxed">
              O maior portal nacional de fotógrafos de casamento do Brasil. Busca por cidade, estilo, preço, comparador de estúdios e orçamentos online.
            </p>

            <div className="flex items-center gap-3 text-[#C7A86A]">
              <Instagram className="w-5 h-5 cursor-pointer hover:text-white" />
              <Facebook className="w-5 h-5 cursor-pointer hover:text-white" />
              <Mail className="w-5 h-5 cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-serif font-bold text-[#C7A86A] uppercase tracking-wider">
              Navegação Principal
            </h4>
            <ul className="space-y-2 text-xs text-[#F6EEE8]/80">
              <li><button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">Início</button></li>
              <li><button onClick={() => setCurrentView('directory')} className="hover:text-white transition-colors">Buscar Fotógrafos</button></li>
              <li><button onClick={() => setCurrentView('compare')} className="hover:text-white transition-colors">Comparar Estúdios</button></li>
              <li><button onClick={() => setCurrentView('weddings')} className="hover:text-white transition-colors">Casamentos Reais</button></li>
              <li><button onClick={() => setCurrentView('tools')} className="hover:text-white transition-colors">Calculadora & Checklist Noivas</button></li>
              <li><button onClick={() => setCurrentView('blog')} className="hover:text-white transition-colors">Blog SEO</button></li>
              <li><button onClick={() => setCurrentView('plans')} className="hover:text-white transition-colors">Anunciar Estúdio (Planos)</button></li>
            </ul>
          </div>

          {/* Top SEO Cities */}
          <div className="space-y-3">
            <h4 className="text-sm font-serif font-bold text-[#C7A86A] uppercase tracking-wider">
              Cidades SEO em Destaque
            </h4>
            <ul className="space-y-2 text-xs text-[#F6EEE8]/80">
              <li><button onClick={() => onSelectCity('Piracicaba')} className="hover:text-white transition-colors">Fotógrafo Casamento Piracicaba</button></li>
              <li><button onClick={() => onSelectCity('São Paulo')} className="hover:text-white transition-colors">Fotógrafo Casamento São Paulo</button></li>
              <li><button onClick={() => onSelectCity('Campinas')} className="hover:text-white transition-colors">Fotógrafo Casamento Campinas</button></li>
              <li><button onClick={() => onSelectCity('Curitiba')} className="hover:text-white transition-colors">Fotógrafo Casamento Curitiba</button></li>
              <li><button onClick={() => onSelectCity('Sorocaba')} className="hover:text-white transition-colors">Fotógrafo Casamento Sorocaba</button></li>
              <li><button onClick={() => onSelectCity('Osasco')} className="hover:text-white transition-colors">Fotógrafo Casamento Osasco</button></li>
            </ul>
          </div>

          {/* Security & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-serif font-bold text-[#C7A86A] uppercase tracking-wider">
              Área Profissional & Gestão
            </h4>
            <p className="text-xs text-[#F6EEE8]/80">
              Acesso exclusivo para estúdios parceiros e gestão do portal.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => setCurrentView('photographer-panel')}
                className="w-full py-2.5 bg-[#C88E9B] hover:bg-[#b07885] text-white font-bold text-xs rounded-xl shadow-sm transition-colors text-center block"
              >
                Painel Pro do Fotógrafo
              </button>

              <button
                onClick={() => setCurrentView('admin-panel')}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-[#C7A86A] border border-[#C7A86A]/40 font-semibold text-xs rounded-xl transition-colors text-center block"
              >
                Painel Administrativo (Admin)
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F6EEE8]/60 gap-4">
          <p>© 2026 Guia Fotógrafo Casamento. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Termos de Uso</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Política de Privacidade</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Moderação de Avaliações</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
