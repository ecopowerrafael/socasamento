import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calculator,
  CheckSquare,
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  Gift,
  Camera,
  MapPin,
  Clock,
  Globe,
  Heart,
  Award,
  CloudSun,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  X,
  MessageSquare,
  Send,
  Download,
  Share2,
  Sliders,
  Eye,
  CheckCircle2,
  AlertCircle,
  Footprints,
  UserCheck,
  Star,
  ExternalLink,
  Bot
} from 'lucide-react';
import {
  BrideGuest,
  BrideGift,
  BrideExpense,
  BrideCalendarEvent,
  BrideInspiration,
  BridePhotoLocation,
  BrideGamificationBadge,
  ChecklistItem,
  Photographer
} from '../types';
import {
  INITIAL_BRIDE_GUESTS,
  INITIAL_BRIDE_GIFTS,
  INITIAL_BRIDE_EXPENSES,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_INSPIRATIONS,
  PHOTO_LOCATIONS,
  INITIAL_TIMELINE_ITEMS,
  GAMIFICATION_BADGES
} from '../data/brideData';
import { INITIAL_CHECKLIST, MOCK_PHOTOGRAPHERS } from '../data/mockData';

interface ToolsCoupleViewProps {
  openMultiQuote?: () => void;
  photographers?: Photographer[];
}

export const ToolsCoupleView: React.FC<ToolsCoupleViewProps> = ({
  openMultiQuote,
  photographers = MOCK_PHOTOGRAPHERS
}) => {
  // Main Active Tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'planning'
    | 'calendar'
    | 'finance'
    | 'guests'
    | 'presents'
    | 'inspirations'
    | 'locations'
    | 'simulator'
    | 'timeline'
    | 'website'
    | 'quiz'
    | 'gamification'
  >('dashboard');

  // --- PERSISTENT STATES ---
  const [weddingDate, setWeddingDate] = useState<string>('2026-11-15');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [guests, setGuests] = useState<BrideGuest[]>(INITIAL_BRIDE_GUESTS);
  const [gifts, setGifts] = useState<BrideGift[]>(INITIAL_BRIDE_GIFTS);
  const [expenses, setExpenses] = useState<BrideExpense[]>(INITIAL_BRIDE_EXPENSES);
  const [calendarEvents, setCalendarEvents] = useState<BrideCalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [inspirations, setInspirations] = useState<BrideInspiration[]>(INITIAL_INSPIRATIONS);
  const [timelineItems, setTimelineItems] = useState(INITIAL_TIMELINE_ITEMS);
  const [badges, setBadges] = useState<BrideGamificationBadge[]>(GAMIFICATION_BADGES);

  // --- FINANCE CALCULATOR STATE ---
  const [totalBudgetInput, setTotalBudgetInput] = useState<number>(80000);
  const [budgetPercentages, setBudgetPercentages] = useState<{ [key: string]: number }>({
    Fotografia: 12,
    Buffet: 35,
    Vestido: 10,
    Decoração: 15,
    Música: 8,
    Convites: 2,
    Cerimonial: 8,
    Outros: 10,
  });

  // Installment simulator input
  const [supplierQuoteInput, setSupplierQuoteInput] = useState<number>(4500);

  // --- SIMULATOR FOR PHOTOGRAPHY LEADS ---
  const [simCity, setSimCity] = useState('Piracicaba');
  const [simGuests, setSimGuests] = useState(150);
  const [simVenue, setSimVenue] = useState('Campo / Fazenda');
  const [simHours, setSimHours] = useState('8h');
  const [simDrone, setSimDrone] = useState(true);
  const [simAlbum, setSimAlbum] = useState(true);
  const [simSecondPhoto, setSimSecondPhoto] = useState(true);
  const [simResult, setSimResult] = useState<{ min: number; max: number } | null>(null);

  // --- QUIZ STATE ---
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<string | null>(null);

  // --- WEDDING SITE STATE ---
  const [siteNames, setSiteNames] = useState('Camila & Fernando');
  const [siteStory, setSiteStory] = useState('Nos conhecemos em 2021 durante uma viagem e desde então soubemos que nosso destino era caminhar juntos. O pedido de casamento aconteceu em um pôr do sol inesquecível!');
  const [siteVenue, setSiteVenue] = useState('Fazenda Roseiras e Lago Imperial');
  const [siteAddress, setSiteAddress] = useState('Rodovia Piracicaba - Anhumas, Km 12 - Piracicaba/SP');

  // Load from localStorage on mount if available
  useEffect(() => {
    try {
      const savedGuests = localStorage.getItem('bride_guests');
      if (savedGuests) setGuests(JSON.parse(savedGuests));

      const savedExpenses = localStorage.getItem('bride_expenses');
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

      const savedGifts = localStorage.getItem('bride_gifts');
      if (savedGifts) setGifts(JSON.parse(savedGifts));

      const savedEvents = localStorage.getItem('bride_calendar');
      if (savedEvents) setCalendarEvents(JSON.parse(savedEvents));

      const savedChecklist = localStorage.getItem('bride_checklist');
      if (savedChecklist) setChecklist(JSON.parse(savedChecklist));
    } catch (e) {
      console.error('Error loading bride toolkit local storage:', e);
    }
  }, []);

  // Sync to localStorage
  const updateGuests = (list: BrideGuest[]) => {
    setGuests(list);
    localStorage.setItem('bride_guests', JSON.stringify(list));
  };

  const updateExpenses = (list: BrideExpense[]) => {
    setExpenses(list);
    localStorage.setItem('bride_expenses', JSON.stringify(list));
  };

  const updateGifts = (list: BrideGift[]) => {
    setGifts(list);
    localStorage.setItem('bride_gifts', JSON.stringify(list));
  };

  const updateEvents = (list: BrideCalendarEvent[]) => {
    setCalendarEvents(list);
    localStorage.setItem('bride_calendar', JSON.stringify(list));
  };

  const updateChecklist = (list: ChecklistItem[]) => {
    setChecklist(list);
    localStorage.setItem('bride_checklist', JSON.stringify(list));
  };

  // --- CALCULATION HELPERS ---
  const daysRemaining = (() => {
    const target = new Date(weddingDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const completedTasksCount = checklist.filter((c) => c.completed).length;
  const checklistProgressPercent = Math.round((completedTasksCount / (checklist.length || 1)) * 100);

  // Financial calculations
  const totalExpensesContracted = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalExpensesPaid = expenses.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  const totalExpensesRemaining = totalBudgetInput - totalExpensesContracted;

  // Guest stats
  const totalGuestsCount = guests.reduce((acc, g) => acc + 1 + (g.companionCount || 0), 0);
  const confirmedGuestsCount = guests
    .filter((g) => g.status === 'confirmado')
    .reduce((acc, g) => acc + 1 + (g.companionCount || 0), 0);
  const pendingGuestsCount = guests
    .filter((g) => g.status === 'pendente')
    .reduce((acc, g) => acc + 1 + (g.companionCount || 0), 0);
  const declinedGuestsCount = guests
    .filter((g) => g.status === 'recusado')
    .reduce((acc, g) => acc + 1 + (g.companionCount || 0), 0);

  // Toggle checklist
  const handleToggleChecklist = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    updateChecklist(updated);
  };

  // Toggle Inspiration Favorite
  const handleToggleInspirationFav = (id: string) => {
    setInspirations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, favorited: !item.favorited, likesCount: item.favorited ? item.likesCount - 1 : item.likesCount + 1 } : item
      )
    );
  };

  // Run Simulator
  const handleRunSimulator = (e: React.FormEvent) => {
    e.preventDefault();
    let base = 3000;
    if (simGuests > 200) base += 1000;
    if (simVenue.includes('Fazenda')) base += 800;
    if (simHours === '12h' || simHours === 'Ilimitado') base += 1200;
    if (simDrone) base += 800;
    if (simAlbum) base += 1200;
    if (simSecondPhoto) base += 1000;

    setSimResult({
      min: Math.round(base * 0.9),
      max: Math.round(base * 1.25),
    });
  };

  // Quiz Questions
  const QUIZ_QUESTIONS = [
    {
      question: 'Onde é o local dos seus sonhos para dizer o "SIM"?',
      options: [
        { label: 'Uma fazenda histórica com muito verde e luzes', style: 'Rústico' },
        { label: 'Pé na areia com o barulho das ondas do mar', style: 'Praiano' },
        { label: 'Um salão nobre com lustres de cristal e orquídeas', style: 'Casamento clássico' },
        { label: 'Espaço ao ar livre intimista no estilo boho chic', style: 'Boho' },
      ],
    },
    {
      question: 'Qual paleta de cores mais faz seu coração acelerar?',
      options: [
        { label: 'Tons terrosos, bege, palha e flores secas', style: 'Boho' },
        { label: 'Branco, verde folhagem e detalhes dourados', style: 'Casamento clássico' },
        { label: 'Cores vibrantes do pôr do sol e coral', style: 'Praiano' },
        { label: 'Madeira maciça, eucalipto e rosa queimado', style: 'Rústico' },
      ],
    },
    {
      question: 'Como você imagina o estilo de fotografia das suas memórias?',
      options: [
        { label: 'Fotografias artísticas, espontâneas e poéticas com tom atemporal', style: 'Boho' },
        { label: 'Poses elegantes, luz bem trabalhada e alta sofisticação', style: 'Casamento clássico' },
        { label: 'Luz natural radiante, momentos descontraídos e risadas', style: 'Praiano' },
        { label: 'Fotos emotivas, documental e foco na natureza', style: 'Rústico' },
      ],
    },
  ];

  const handleSelectQuizOption = (styleChoice: string) => {
    const nextAnswers = [...quizAnswers, styleChoice];
    setQuizAnswers(nextAnswers);
    if (quizStep + 1 < QUIZ_QUESTIONS.length) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate most frequent style
      const counts: { [key: string]: number } = {};
      nextAnswers.forEach((a) => (counts[a] = (counts[a] || 0) + 1));
      let maxStyle = 'Boho';
      let maxVal = 0;
      Object.entries(counts).forEach(([st, val]) => {
        if (val > maxVal) {
          maxVal = val;
          maxStyle = st;
        }
      });
      setQuizResult(maxStyle);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Portal do Casal */}
      <div className="bg-gradient-to-r from-[#5A4035] via-[#6d4f43] to-[#5A4035] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C7A86A]/20 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-[#C7A86A] border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#C7A86A]" />
              <span>Ferramenta Noivas & Casal • Suíte Completa</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Painel de Planejamento de Casamento
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl">
              Organize cada detalhe: contagem regressiva, agenda de compromissos, finanças, convidados, lista de presentes, inspirações e simulação de fornecedores.
            </p>
          </div>

          {/* Countdown Highlight Box */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 text-center space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#C7A86A]">Contagem Regressiva</span>
            <div className="text-3xl font-serif font-bold text-white">
              {daysRemaining} <span className="text-sm font-sans font-normal text-white/80">Dias</span>
            </div>
            <span className="text-[10px] text-emerald-300 font-semibold block">
              {checklistProgressPercent}% do Planejamento Concluído
            </span>
          </div>
        </div>
      </div>

      {/* NAV TABS SUITE (13 Modules) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 no-scrollbar text-xs font-bold">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
          { id: 'planning', label: 'Planejamento', icon: CheckSquare },
          { id: 'calendar', label: 'Agenda', icon: CalendarIcon },
          { id: 'finance', label: 'Finanças', icon: DollarSign },
          { id: 'guests', label: 'Convidados', icon: Users },
          { id: 'presents', label: 'Presentes', icon: Gift },
          { id: 'inspirations', label: 'Inspirações', icon: Camera },
          { id: 'locations', label: 'Roteiro Ensaio', icon: MapPin },
          { id: 'simulator', label: 'Simulador Orçamento', icon: Calculator },
          { id: 'timeline', label: 'Cronograma', icon: Clock },
          { id: 'website', label: 'Site do Casal', icon: Globe },
          { id: 'quiz', label: 'Quiz Estilo', icon: Heart },
          { id: 'gamification', label: 'Conquistas', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#C88E9B] text-white shadow-sm'
                  : 'bg-white text-[#5A4035] hover:bg-[#FAF5F0] border border-stone-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#C7A86A]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 1. DASHBOARD DA NOIVA */}
      {/* ==================================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-[#C88E9B]">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Dias para o Casamento</span>
                <Heart className="w-4 h-4 fill-[#C88E9B]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#5A4035]">{daysRemaining} Dias</div>
              <span className="text-[10px] text-stone-400 block">Data: 15 de Novembro de 2026</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-[#C7A86A]">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Progresso Geral</span>
                <CheckSquare className="w-4 h-4" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#5A4035]">{checklistProgressPercent}%</div>
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#C88E9B] h-full transition-all" style={{ width: `${checklistProgressPercent}%` }} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Orçamento Restante</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="text-2xl font-serif font-bold text-emerald-700">
                R$ {totalExpensesRemaining.toLocaleString('pt-BR')}
              </div>
              <span className="text-[10px] text-stone-400 block">Previsto: R$ {totalBudgetInput.toLocaleString('pt-BR')}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Previsão do Tempo</span>
                <CloudSun className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-serif font-bold text-[#5A4035]">26°C Sol & Céu Limpo</div>
              <span className="text-[10px] text-emerald-600 font-semibold block">Clima Ideal para Cerimônia Externa</span>
            </div>
          </div>

          {/* Middle Row: Checklist Quick View & Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Checklist Box */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#5A4035]">✅ Próximas Tarefas Prioritárias</h2>
                  <p className="text-xs text-stone-500">Mantenha seu planejamento em dia completando as metas por prazo</p>
                </div>
                <button
                  onClick={() => setActiveTab('planning')}
                  className="text-xs font-bold text-[#C88E9B] hover:underline flex items-center gap-1"
                >
                  Ver Tudo <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {checklist.slice(0, 5).map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      item.completed
                        ? 'bg-emerald-50/60 border-emerald-200 text-stone-500'
                        : 'bg-stone-50 border-stone-200 text-[#5A4035]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(item.id)}
                        className="w-4 h-4 text-[#C88E9B] rounded focus:ring-0 cursor-pointer"
                      />
                      <span className={`text-xs font-semibold ${item.completed ? 'line-through' : ''}`}>
                        {item.task}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white rounded-md border border-stone-200 text-stone-500">
                      {item.timeframe}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="text-lg font-serif font-bold text-[#5A4035]">📅 Próximos Compromissos</h2>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="text-xs font-bold text-[#C88E9B] hover:underline flex items-center gap-1"
                >
                  Agenda <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {calendarEvents.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="p-3 bg-[#FAF5F0] rounded-xl border border-[#C88E9B]/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C88E9B]">{ev.type}</span>
                      <span className="text-[10px] font-bold text-[#5A4035]">{ev.date} às {ev.time}</span>
                    </div>
                    <div className="text-xs font-bold text-[#5A4035]">{ev.title}</div>
                    {ev.location && <div className="text-[10px] text-stone-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-stone-400" /> {ev.location}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Photographer Answers & Recommended Studio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-[#5A4035]">📨 Respostas de Cotação de Fotógrafos</h3>
                <button onClick={openMultiQuote} className="text-xs font-bold text-[#C88E9B] hover:underline">
                  Pedir Cotação
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#FAF5F0] rounded-xl border border-stone-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C88E9B] text-white flex items-center justify-center font-bold font-serif">
                    LP
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#5A4035]">Estúdio Lucas Perez</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Proposta Enviada</span>
                    </div>
                    <p className="text-stone-500 text-[11px] line-clamp-1">Olá Camila! Temos a data 15/11/2026 livre para cobertura com drone inclusa...</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#5A4035] text-white rounded-3xl p-6 space-y-4 shadow-md">
              <span className="text-xs font-bold text-[#C7A86A] uppercase tracking-wider">Últimos Fotógrafos Visitados</span>
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/15">
                <img
                  src={photographers[0]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                  alt="Fotógrafo"
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-serif font-bold text-sm text-white">{photographers[0]?.studioName || 'Lucas Perez Fotografia'}</h4>
                  <span className="text-[10px] text-white/80 block">{photographers[0]?.city} • {photographers[0]?.styles?.join(', ')}</span>
                </div>
                <button
                  onClick={() => window.location.href = `/fotografo/${photographers[0]?.slug || 'fotografo-perez'}`}
                  className="px-3 py-1.5 bg-[#C7A86A] text-[#5A4035] rounded-xl font-bold text-xs cursor-pointer"
                >
                  Ver Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. PLANEJAMENTO */}
      {/* ==================================================================== */}
      {activeTab === 'planning' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#5A4035]">💍 Checklist & Metas do Casamento</h2>
                <p className="text-xs text-stone-500">
                  Organize todas as etapas até a data do grande dia ({weddingDate})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#5A4035]">Data do Casamento:</span>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-[#5A4035]"
                />
              </div>
            </div>

            {/* Checklist Items list */}
            <div className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    item.completed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-stone-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="w-5 h-5 text-[#C88E9B] rounded focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className={`text-sm font-bold ${item.completed ? 'line-through text-stone-400' : 'text-[#5A4035]'}`}>
                        {item.task}
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium">Categoria: {item.category}</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 bg-stone-100 text-stone-700 rounded-full shrink-0">
                    {item.timeframe}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. AGENDA DO CASAMENTO */}
      {/* ==================================================================== */}
      {activeTab === 'calendar' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#5A4035]">📆 Agenda de Compromissos do Casamento</h2>
                <p className="text-xs text-stone-500">
                  Degustações, Provas de Vestido, Reuniões com Fotógrafo, Chá de Panela e Casamento Civil.
                </p>
              </div>

              <button
                onClick={() => {
                  const title = prompt('Título do compromisso:');
                  if (title) {
                    const newEv: BrideCalendarEvent = {
                      id: String(Date.now()),
                      title,
                      type: 'Reunião com fotógrafo',
                      date: '2026-09-15',
                      time: '15:00',
                      notify: true,
                    };
                    updateEvents([...calendarEvents, newEv]);
                  }
                }}
                className="px-4 py-2.5 bg-[#C88E9B] hover:bg-[#b07885] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Compromisso</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calendarEvents.map((ev) => (
                <div key={ev.id} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 bg-[#5A4035] text-white rounded-full">
                      {ev.type}
                    </span>
                    <span className="text-xs font-bold text-[#C88E9B]">
                      {ev.date} às {ev.time}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#5A4035]">{ev.title}</h3>
                  {ev.location && (
                    <div className="text-xs text-stone-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C7A86A]" /> {ev.location}
                    </div>
                  )}
                  {ev.notes && <p className="text-xs text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200">{ev.notes}</p>}

                  <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Lembrete e Notificação Ativos
                    </span>
                    <button
                      onClick={() => updateEvents(calendarEvents.filter((x) => x.id !== ev.id))}
                      className="text-rose-500 hover:underline font-bold"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. FERRAMENTAS FINANCEIRAS */}
      {/* ==================================================================== */}
      {activeTab === 'finance' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase text-stone-400">Orçamento Previsto</span>
              <div className="text-3xl font-serif font-bold text-[#5A4035]">
                R$ {totalBudgetInput.toLocaleString('pt-BR')}
              </div>
              <input
                type="number"
                step={1000}
                value={totalBudgetInput}
                onChange={(e) => setTotalBudgetInput(Number(e.target.value))}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-xl font-bold mt-2"
              />
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase text-stone-400">Gasto Contratado</span>
              <div className="text-3xl font-serif font-bold text-[#C88E9B]">
                R$ {totalExpensesContracted.toLocaleString('pt-BR')}
              </div>
              <span className="text-xs text-stone-500 block">Pago: R$ {totalExpensesPaid.toLocaleString('pt-BR')}</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase text-stone-400">Restante Livre</span>
              <div className="text-3xl font-serif font-bold text-emerald-700">
                R$ {totalExpensesRemaining.toLocaleString('pt-BR')}
              </div>
              <span className="text-xs text-emerald-600 font-semibold block">Margem de segurança financeira</span>
            </div>
          </div>

          {/* Automatic Budget Distribution */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#5A4035]">Calculadora de Distribuição de Orçamento</h2>
              <p className="text-xs text-stone-500">Distribuição recomendada automaticamente pelo sistema com edição livre de percentuais</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(budgetPercentages).map(([cat, pct]) => {
                const numPct = Number(pct) || 0;
                const amount = Math.round((totalBudgetInput * numPct) / 100);
                return (
                  <div key={cat} className="p-4 bg-[#FAF5F0] rounded-2xl border border-[#C88E9B]/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#5A4035]">{cat}</span>
                      <span className="text-xs font-bold text-[#C88E9B]">{numPct}%</span>
                    </div>
                    <div className="text-lg font-serif font-bold text-[#5A4035]">
                      R$ {amount.toLocaleString('pt-BR')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controle de Gastos & Tabela de Fornecedores */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <h2 className="text-xl font-serif font-bold text-[#5A4035]">Controle de Gastos & Fornecedores</h2>
              <button
                onClick={() => {
                  const supplier = prompt('Nome do Fornecedor:');
                  const amount = Number(prompt('Valor contratado (R$):') || '0');
                  if (supplier && amount > 0) {
                    const newExp: BrideExpense = {
                      id: String(Date.now()),
                      category: 'Outros',
                      supplier,
                      amount,
                      paidAmount: Math.round(amount / 2),
                      dueDate: '2026-10-01',
                    };
                    updateExpenses([...expenses, newExp]);
                  }
                }}
                className="px-4 py-2 bg-[#C88E9B] hover:bg-[#b07885] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                + Cadastrar Fornecedor
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3">Fornecedor</th>
                    <th className="py-3 px-3">Valor Contratado</th>
                    <th className="py-3 px-3">Valor Pago</th>
                    <th className="py-3 px-3">Falta Pagar</th>
                    <th className="py-3 px-3">Vencimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-[#5A4035]">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-stone-50">
                      <td className="py-3 px-3 font-bold">{exp.category}</td>
                      <td className="py-3 px-3">{exp.supplier}</td>
                      <td className="py-3 px-3 font-bold">R$ {exp.amount.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-3 text-emerald-700 font-bold">R$ {exp.paidAmount.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-3 text-rose-600 font-bold">
                        R$ {(exp.amount - exp.paidAmount).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-3 text-stone-500">{exp.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simulador de Parcelamento */}
          <div className="bg-[#5A4035] text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-4">
            <h3 className="text-xl font-serif font-bold text-[#C7A86A]">Simulador de Parcelamento de Contrato</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="text-xs font-bold text-white/80">Valor do Contrato (ex: Fotógrafo):</label>
              <input
                type="number"
                value={supplierQuoteInput}
                onChange={(e) => setSupplierQuoteInput(Number(e.target.value))}
                className="p-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-bold text-white w-48"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {[12, 10, 8, 6].map((parc) => (
                <div key={parc} className="p-4 bg-white/10 rounded-2xl border border-white/15 text-center space-y-1">
                  <span className="text-xs text-[#C7A86A] font-bold block">{parc}x Sem Juros</span>
                  <div className="text-lg font-serif font-bold text-white">
                    R$ {(supplierQuoteInput / parc).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. LISTA DE CONVIDADOS */}
      {/* ==================================================================== */}
      {activeTab === 'guests' && (
        <div className="space-y-6 animate-fade-in">
          {/* Dashboard Estatístico Exigido */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 text-center shadow-xs">
              <span className="text-xs font-bold text-stone-400 block uppercase">Total Convidados</span>
              <div className="text-3xl font-serif font-bold text-[#5A4035]">{totalGuestsCount}</div>
            </div>
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 text-center shadow-xs">
              <span className="text-xs font-bold text-emerald-800 block uppercase">Confirmados</span>
              <div className="text-3xl font-serif font-bold text-emerald-700">{confirmedGuestsCount}</div>
            </div>
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-center shadow-xs">
              <span className="text-xs font-bold text-amber-800 block uppercase">Pendentes</span>
              <div className="text-3xl font-serif font-bold text-amber-700">{pendingGuestsCount}</div>
            </div>
            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 text-center shadow-xs">
              <span className="text-xs font-bold text-rose-800 block uppercase">Recusaram</span>
              <div className="text-3xl font-serif font-bold text-rose-700">{declinedGuestsCount}</div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <h2 className="text-2xl font-serif font-bold text-[#5A4035]">👰 Gestão da Lista de Convidados</h2>
              <button
                onClick={() => {
                  const name = prompt('Nome do Convidado:');
                  if (name) {
                    const newGuest: BrideGuest = {
                      id: String(Date.now()),
                      name,
                      phone: '(19) 99999-8888',
                      family: 'Amigos',
                      status: 'pendente',
                      companionCount: 1,
                      tableNumber: 'Mesa A',
                    };
                    updateGuests([...guests, newGuest]);
                  }
                }}
                className="px-4 py-2.5 bg-[#C88E9B] hover:bg-[#b07885] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                + Adicionar Convidado
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Nome</th>
                    <th className="py-3 px-3">Telefone</th>
                    <th className="py-3 px-3">Família / Grupo</th>
                    <th className="py-3 px-3">Acompanhantes</th>
                    <th className="py-3 px-3">Mesa</th>
                    <th className="py-3 px-3">Status Confirmado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-[#5A4035]">
                  {guests.map((g) => (
                    <tr key={g.id} className="hover:bg-stone-50">
                      <td className="py-3 px-3 font-bold">{g.name}</td>
                      <td className="py-3 px-3 text-stone-500">{g.phone}</td>
                      <td className="py-3 px-3">{g.family}</td>
                      <td className="py-3 px-3">+{g.companionCount} pessoas</td>
                      <td className="py-3 px-3 font-bold">{g.tableNumber}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                            g.status === 'confirmado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : g.status === 'pendente'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. LISTA DE PRESENTES */}
      {/* ==================================================================== */}
      {activeTab === 'presents' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#5A4035]">🎁 Lista de Presentes do Casal</h2>
                <p className="text-xs text-stone-500">Cadastre os itens desejados e acompanhe quem presenteou</p>
              </div>

              <button
                onClick={() => {
                  const title = prompt('Nome do presente:');
                  const value = Number(prompt('Valor aproximado (R$):') || '200');
                  if (title) {
                    const newG: BrideGift = {
                      id: String(Date.now()),
                      title,
                      value,
                      purchased: false,
                      category: 'Cozinha',
                    };
                    updateGifts([...gifts, newG]);
                  }
                }}
                className="px-4 py-2.5 bg-[#C88E9B] hover:bg-[#b07885] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                + Cadastrar Presente
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifts.map((gift) => (
                <div key={gift.id} className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-3 relative">
                  {gift.imageUrl && (
                    <img src={gift.imageUrl} alt={gift.title} className="w-full h-36 object-cover rounded-xl" />
                  )}
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#5A4035]">{gift.title}</h3>
                    <div className="text-sm font-serif font-bold text-[#C88E9B] mt-1">
                      R$ {gift.value.toLocaleString('pt-BR')}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                    {gift.purchased ? (
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-full text-[10px]">
                        Comprado por {gift.givenBy || 'Convidado'}
                      </span>
                    ) : (
                      <span className="text-stone-400 font-semibold text-[10px]">Disponível para presente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. INSPIRAÇÕES (PINTEREST INTERNO) */}
      {/* ==================================================================== */}
      {activeTab === 'inspirations' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#5A4035]">📸 Pinterest Interno de Inspirações</h2>
              <p className="text-xs text-stone-500">Salve e meça referências de decoração, vestido, fotografia, maquiagem e bolo</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {inspirations.map((item) => (
                <div key={item.id} className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden group shadow-2xs hover:shadow-md transition-all">
                  <div className="relative aspect-4/3">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <button
                      onClick={() => handleToggleInspirationFav(item.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs shadow-md transition-transform active:scale-90 cursor-pointer ${
                        item.favorited ? 'bg-rose-500 text-white' : 'bg-white/80 text-stone-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${item.favorited ? 'fill-white' : ''}`} />
                    </button>
                  </div>
                  <div className="p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#C88E9B]">{item.category}</span>
                    <h3 className="text-xs font-bold text-[#5A4035] line-clamp-2">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 8. ROTEIRO FOTOGRÁFICO (GUIA DE LOCAIS PARA ENSAIO) */}
      {/* ==================================================================== */}
      {activeTab === 'locations' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#5A4035]">📍 Guia de Roteiro Fotográfico para Ensaios</h2>
              <p className="text-xs text-stone-500">Locais ideais para pré-wedding divididos por categoria</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PHOTO_LOCATIONS.map((loc) => (
                <div key={loc.id} className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-2xs space-y-3 p-4">
                  <img src={loc.coverImage} alt={loc.name} className="w-full h-44 object-cover rounded-xl" />
                  <span className="inline-block px-2.5 py-0.5 bg-[#5A4035] text-white text-[10px] font-bold uppercase rounded-full">
                    {loc.category}
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#5A4035]">{loc.name}</h3>
                  <div className="text-xs text-stone-600 space-y-1">
                    <p>📍 <strong>Cidade:</strong> {loc.city}/{loc.state}</p>
                    <p>☀️ <strong>Horário Ideal:</strong> {loc.idealTime}</p>
                    <p>📑 <strong>Autorização:</strong> {loc.needAuthorization ? loc.feeInfo : 'Livre'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 9. SIMULADOR DE ORÇAMENTO DE FOTOGRAFIA (GERADOR DE LEADS) */}
      {/* ==================================================================== */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#5A4035]">📷 Simulador de Orçamento de Fotografia</h2>
              <p className="text-xs text-stone-500">Responda o questionário e receba estimativa imediata de valores com recomendação de estúdios</p>
            </div>

            <form onSubmit={handleRunSimulator} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Cidade do Casamento</label>
                <input
                  type="text"
                  value={simCity}
                  onChange={(e) => setSimCity(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Número de Convidados</label>
                <input
                  type="number"
                  value={simGuests}
                  onChange={(e) => setSimGuests(Number(e.target.value))}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Tipo de Casamento</label>
                <select
                  value={simVenue}
                  onChange={(e) => setSimVenue(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  <option value="Campo / Fazenda">Campo / Fazenda</option>
                  <option value="Praia">Praia</option>
                  <option value="Igreja & Salão">Igreja & Salão Tradicional</option>
                  <option value="Mini Wedding">Mini Wedding Intimista</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Horas de Cobertura</label>
                <select
                  value={simHours}
                  onChange={(e) => setSimHours(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  <option value="6h">6 Horas</option>
                  <option value="8h">8 Horas</option>
                  <option value="12h">12 Horas</option>
                  <option value="Ilimitado">Ilimitado (O Dia Todo)</option>
                </select>
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#5A4035]">
                  <input type="checkbox" checked={simDrone} onChange={(e) => setSimDrone(e.target.checked)} className="rounded text-[#C88E9B]" />
                  <span>Incluir Drone 4K</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#5A4035]">
                  <input type="checkbox" checked={simAlbum} onChange={(e) => setSimAlbum(e.target.checked)} className="rounded text-[#C88E9B]" />
                  <span>Incluir Álbum Impresso Enquadrado</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#5A4035]">
                  <input type="checkbox" checked={simSecondPhoto} onChange={(e) => setSimSecondPhoto(e.target.checked)} className="rounded text-[#C88E9B]" />
                  <span>Segundo Fotógrafo Ativo</span>
                </label>
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#C88E9B] hover:bg-[#b07885] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Calcular Estimativa de Preço
                </button>
              </div>
            </form>

            {simResult && (
              <div className="p-6 bg-[#5A4035] text-white rounded-2xl space-y-4 shadow-lg animate-fade-in">
                <span className="text-xs font-bold text-[#C7A86A] uppercase tracking-wider">Faixa Estimada de Investimento</span>
                <div className="text-3xl font-serif font-bold text-[#C7A86A]">
                  R$ {simResult.min.toLocaleString('pt-BR')} a R$ {simResult.max.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-white/80">
                  Estimativa calculada para cobertura na região de {simCity}. Fotógrafos renomados disponíveis para consulta imediata!
                </p>
                <button
                  onClick={openMultiQuote}
                  className="px-5 py-2.5 bg-[#C7A86A] text-[#5A4035] rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                >
                  Solicitar Cotação em 1-Clique para Estúdios da Região
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 10. CRONOGRAMA DO DIA */}
      {/* ==================================================================== */}
      {activeTab === 'timeline' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#5A4035]">📝 Gerador de Cronograma do Casamento</h2>
                <p className="text-xs text-stone-500">Linha do tempo gerada automaticamente para alinhar com o cerimonial e equipe de fotografia</p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Imprimir Cronograma
              </button>
            </div>

            <div className="space-y-4">
              {timelineItems.map((item, idx) => (
                <div key={item.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-4">
                  <div className="p-3 bg-[#C88E9B] text-white rounded-xl font-serif font-bold text-sm shrink-0">
                    {item.time}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#5A4035]">{item.title}</h3>
                    <p className="text-xs text-stone-600 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 11. SITE DO CASAMENTO */}
      {/* ==================================================================== */}
      {activeTab === 'website' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#5A4035]">💌 Mini Site Gratuito do Casamento</h2>
              <p className="text-xs text-stone-500">Personalize a história do casal, mapa, RSVP e lista de presentes para compartilhar</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form config */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Nome do Casal</label>
                  <input
                    type="text"
                    value={siteNames}
                    onChange={(e) => setSiteNames(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Nossa História</label>
                  <textarea
                    rows={4}
                    value={siteStory}
                    onChange={(e) => setSiteStory(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5A4035] mb-1">Local da Cerimônia / Festa</label>
                  <input
                    type="text"
                    value={siteVenue}
                    onChange={(e) => setSiteVenue(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-[#FAF5F0] rounded-3xl p-6 border-2 border-[#C88E9B]/30 space-y-4 text-center">
                <span className="text-[10px] font-bold uppercase text-[#C88E9B] tracking-widest">Preview do Mini Site</span>
                <h3 className="text-3xl font-serif font-bold text-[#5A4035]">{siteNames}</h3>
                <p className="text-xs text-[#5A4035]/80 italic">"{siteStory}"</p>
                <div className="p-3 bg-white rounded-2xl border border-stone-200 text-xs text-[#5A4035] font-bold">
                  📍 {siteVenue}
                </div>
                <button
                  onClick={() => alert(`Link público gerado: https://noivas.guiafotografo.com.br/casal/${encodeURIComponent(siteNames)}`)}
                  className="px-5 py-2.5 bg-[#C88E9B] text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                >
                  Copiar Link para Enviar no WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 12. QUIZ "DESCUBRA SEU ESTILO" */}
      {/* ==================================================================== */}
      {activeTab === 'quiz' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            {!quizResult ? (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-xs font-bold text-[#C88E9B] uppercase tracking-wider">Passo {quizStep + 1} de {QUIZ_QUESTIONS.length}</span>
                  <h2 className="text-2xl font-serif font-bold text-[#5A4035]">{QUIZ_QUESTIONS[quizStep].question}</h2>
                </div>

                <div className="space-y-3">
                  {QUIZ_QUESTIONS[quizStep].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(opt.style)}
                      className="w-full p-4 bg-stone-50 hover:bg-[#FAF5F0] hover:border-[#C88E9B] border border-stone-200 rounded-2xl text-left text-xs font-bold text-[#5A4035] transition-all cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto text-center space-y-6 bg-[#5A4035] text-white p-8 rounded-3xl shadow-xl">
                <span className="text-xs font-bold text-[#C7A86A] uppercase tracking-widest">Resultado do Quiz</span>
                <h2 className="text-3xl font-serif font-bold text-white">Seu Estilo Ideal é: <span className="text-[#C7A86A]">{quizResult}</span></h2>
                <p className="text-xs text-white/80">
                  Seu perfil combina perfeitamente com coberturas fotográficaspoéticas, com foco na luz natural e momentos espontâneos.
                </p>

                <button
                  onClick={() => {
                    setQuizStep(0);
                    setQuizAnswers([]);
                    setQuizResult(null);
                  }}
                  className="px-5 py-2.5 bg-[#C7A86A] text-[#5A4035] rounded-xl font-bold text-xs cursor-pointer"
                >
                  Refazer Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 13. GAMIFICAÇÃO */}
      {/* ==================================================================== */}
      {activeTab === 'gamification' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#5A4035]">🏆 Conquistas & Gamificação da Noiva</h2>
              <p className="text-xs text-stone-500">Conquiste medalhas conforme avança no planejamento do seu casamento</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-6 rounded-3xl border transition-all space-y-3 ${
                    b.unlocked
                      ? 'bg-gradient-to-br from-[#FAF5F0] to-white border-[#C88E9B] shadow-sm'
                      : 'bg-stone-50 border-stone-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🏅</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${b.unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                      {b.unlocked ? 'Desbloqueado' : 'Em Progresso'}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#5A4035]">{b.title}</h3>
                  <p className="text-xs text-stone-500">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
