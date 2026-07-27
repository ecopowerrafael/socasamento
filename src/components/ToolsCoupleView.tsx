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
  Photographer,
  UserSession,
} from '../types';

interface ToolsCoupleViewProps {
  userSession?: UserSession | null;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  openMultiQuote?: () => void;
  photographers?: Photographer[];
}

export const ToolsCoupleView: React.FC<ToolsCoupleViewProps> = ({
  userSession,
  onNavigateLogin,
  onNavigateRegister,
  openMultiQuote,
  photographers = []
}) => {
  const [isSavePromptOpen, setIsSavePromptOpen] = useState<boolean>(false);
  const [dbLoading, setDbLoading] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string>('');
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [weddingDate, setWeddingDate] = useState<string>('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [guests, setGuests] = useState<BrideGuest[]>([]);
  const [gifts, setGifts] = useState<BrideGift[]>([]);
  const [expenses, setExpenses] = useState<BrideExpense[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<BrideCalendarEvent[]>([]);
  const [inspirations, setInspirations] = useState<BrideInspiration[]>([]);
  const [photoLocations, setPhotoLocations] = useState<BridePhotoLocation[]>([]);
  const [timelineItems, setTimelineItems] = useState<any[]>([]);
  const [badges, setBadges] = useState<BrideGamificationBadge[]>([]);

  // --- FINANCE CALCULATOR STATE ---
  const [totalBudgetInput, setTotalBudgetInput] = useState<number>(0);
  const [budgetPercentages, setBudgetPercentages] = useState<{ [key: string]: number }>({});

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
  const [siteNames, setSiteNames] = useState('');
  const [siteStory, setSiteStory] = useState('');
  const [siteVenue, setSiteVenue] = useState('');
  const [siteAddress, setSiteAddress] = useState('');

  const requireBrideLogin = () => {
    if (userSession) return true;
    setIsSavePromptOpen(true);
    return false;
  };

  const requestJson = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    const body = await response.json();
    if (!response.ok || body.success === false) {
      throw new Error(body.error || 'Não foi possível acessar os dados no MySQL.');
    }
    return body;
  };

  useEffect(() => {
    const loadPublicCatalogs = async () => {
      try {
        const [inspirationData, locationData] = await Promise.all([
          requestJson('/api/inspirations'),
          requestJson('/api/photo-locations'),
        ]);
        setInspirations(
          (inspirationData.inspirations || []).map((item: any) => ({
            id: String(item.id),
            title: item.title,
            category: item.category,
            imageUrl: item.imageUrl,
            likesCount: Number(item.likesCount || 0),
            favorited: false,
          }))
        );
        setPhotoLocations(
          (locationData.locations || []).map((location: any) => ({
            id: String(location.id),
            name: location.name,
            category: location.category,
            city: location.city,
            state: location.state,
            coverImage: location.coverImage,
            idealTime: location.idealTime,
            needAuthorization: Boolean(location.needAuthorization),
            feeInfo: location.feeInfo || undefined,
            description: location.description,
            address: location.address || undefined,
          }))
        );
      } catch (err) {
        setDataError(err instanceof Error ? err.message : 'Não foi possível carregar os catálogos.');
      }
    };
    loadPublicCatalogs();
  }, []);

  // Catálogos públicos e dados pessoais são sempre carregados do MySQL.
  useEffect(() => {
    if (!userSession) {
      setChecklist([]);
      setGuests([]);
      setExpenses([]);
      setGifts([]);
      setCalendarEvents([]);
      setTimelineItems([]);
      setBadges([]);
      return;
    }

    // Authenticated user - Load real MySQL database records
    const fetchBrideData = async () => {
      try {
        setDbLoading(true);
        setDataError('');
        // Profile
        const profRes = await fetch('/api/bride/profile');
        const profData = await profRes.json();
        if (profData.success && profData.profile?.weddingDate) {
          setWeddingDate(String(profData.profile.weddingDate).split('T')[0]);
        }

        // Tasks
        const tasksRes = await fetch('/api/bride/tasks');
        const tasksData = await tasksRes.json();
        if (tasksData.success && Array.isArray(tasksData.tasks)) {
          setChecklist(
            tasksData.tasks.map((t: any) => ({
              id: String(t.id),
              task: t.title,
              category: t.category || 'Fotografia',
              timeframe: t.recommendedMonth || 'Personalizado',
              completed: Boolean(t.isCompleted),
            }))
          );
        }

        // Expenses
        const expensesRes = await fetch('/api/bride/expenses');
        const expensesData = await expensesRes.json();
        if (expensesData.success && Array.isArray(expensesData.expenses)) {
          setExpenses(
            expensesData.expenses.map((e: any) => ({
              id: String(e.id),
              supplier: e.supplierName,
              category: e.category,
              amount: parseFloat(e.contractedAmount || '0'),
              paidAmount: parseFloat(e.paidAmount || '0'),
              dueDate: e.dueDate || '',
            }))
          );
        }

        // Guests
        const guestsRes = await fetch('/api/bride/guests');
        const guestsData = await guestsRes.json();
        if (guestsData.success && Array.isArray(guestsData.guests)) {
          setGuests(
            guestsData.guests.map((g: any) => ({
              id: String(g.id),
              name: g.name,
              phone: g.phone || '',
              family: g.familyGroup || 'Geral',
              status: g.confirmationStatus === 'confirmed' ? 'confirmado' : g.confirmationStatus === 'declined' ? 'recusado' : 'pendente',
              companionCount: g.companions || 0,
              tableNumber: g.tableName || '',
            }))
          );
        }

        // Gifts
        const giftsRes = await fetch('/api/bride/gifts');
        const giftsData = await giftsRes.json();
        if (giftsData.success && Array.isArray(giftsData.gifts)) {
          setGifts(
            giftsData.gifts.map((g: any) => ({
              id: String(g.id),
              title: g.name,
              value: parseFloat(g.estimatedValue || '0'),
              category: g.description || 'Geral',
              purchased: Boolean(g.isPurchased),
              givenBy: g.purchasedBy || undefined,
              imageUrl: g.image || undefined,
            }))
          );
        }

        // Events
        const eventsRes = await fetch('/api/bride/events');
        const eventsData = await eventsRes.json();
        if (eventsData.success && Array.isArray(eventsData.events)) {
          setCalendarEvents(
            eventsData.events.map((ev: any) => ({
              id: String(ev.id),
              title: ev.title,
              date: ev.startAt ? ev.startAt.split('T')[0] : '',
              time: ev.startAt && ev.startAt.includes('T') ? ev.startAt.split('T')[1].substring(0, 5) : '09:00',
              type: ev.eventType || 'Outros',
              location: ev.location || undefined,
              notify: Boolean(ev.reminderEnabled),
              notes: ev.description || undefined,
            }))
          );
        }

        // Timeline
        const timelineRes = await fetch('/api/bride/timeline');
        const timelineData = await timelineRes.json();
        if (timelineData.success && Array.isArray(timelineData.items)) {
          setTimelineItems(
            timelineData.items.map((item: any) => ({
              id: String(item.id),
              time: item.time,
              title: item.title,
              desc: item.description || '',
              icon: 'Clock',
            }))
          );
        }

        // Website
        const siteRes = await fetch('/api/bride/wedding-website');
        const siteData = await siteRes.json();
        if (siteData.success && siteData.website) {
          if (siteData.website.coupleNames) setSiteNames(siteData.website.coupleNames);
          if (siteData.website.story) setSiteStory(siteData.website.story);
          if (siteData.website.ceremonyLocation) setSiteVenue(siteData.website.ceremonyLocation);
          if (siteData.website.receptionLocation) setSiteAddress(siteData.website.receptionLocation);
        }

        const [budgetData, achievementsData, favoritesData] = await Promise.all([
          requestJson('/api/bride/budget'),
          requestJson('/api/bride/achievements'),
          requestJson('/api/bride/favorites/inspirations'),
        ]);
        if (budgetData.budget) {
          setTotalBudgetInput(parseFloat(budgetData.budget.totalBudget || '0'));
        }
        if (Array.isArray(budgetData.categories)) {
          setBudgetPercentages(
            Object.fromEntries(
              budgetData.categories.map((category: any) => [
                category.categoryName,
                parseFloat(category.percentage || '0'),
              ])
            )
          );
        }
        setBadges(
          (achievementsData.achievements || []).map((achievement: any) => ({
            id: String(achievement.id),
            title: achievement.name,
            icon: achievement.icon || 'Award',
            unlocked: Boolean(achievement.unlocked),
            description: achievement.description || '',
          }))
        );
        const favoriteIds = new Set(
          (favoritesData.favorites || []).map((favorite: any) => String(favorite.inspirationId))
        );
        setInspirations((items) =>
          items.map((item) => ({ ...item, favorited: favoriteIds.has(item.id) }))
        );
        const quizData = await requestJson('/api/bride/quiz');
        if (quizData.quizResult) {
          setQuizResult(quizData.quizResult.resultStyle || null);
          const storedAnswers = quizData.quizResult.answersJson;
          setQuizAnswers(Array.isArray(storedAnswers) ? storedAnswers : []);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do banco MySQL:', err);
        setDataError(err instanceof Error ? err.message : 'Não foi possível carregar os dados do MySQL.');
      } finally {
        setDbLoading(false);
      }
    };

    fetchBrideData();
  }, [userSession]);

  const updateGuests = async (list: BrideGuest[]) => {
    if (!requireBrideLogin()) return;
    const added = list.find((item) => !guests.some((current) => current.id === item.id));
    if (!added) return;
    try {
      const result = await requestJson('/api/bride/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: added.name,
          phone: added.phone,
          familyGroup: added.family,
          companions: added.companionCount,
          tableName: added.tableNumber,
          confirmationStatus: added.status === 'confirmado' ? 'confirmed' : added.status === 'recusado' ? 'declined' : 'pending',
        }),
      });
      setGuests([...guests, { ...added, id: String(result.guest.id) }]);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Erro ao salvar convidado.');
    }
  };

  const updateExpenses = async (list: BrideExpense[]) => {
    if (!requireBrideLogin()) return;
    const added = list.find((item) => !expenses.some((current) => current.id === item.id));
    if (!added) return;
    try {
      const result = await requestJson('/api/bride/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName: added.supplier,
          category: added.category,
          contractedAmount: added.amount,
          paidAmount: added.paidAmount,
          dueDate: added.dueDate,
        }),
      });
      setExpenses([...expenses, { ...added, id: String(result.expense.id) }]);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Erro ao salvar despesa.');
    }
  };

  const updateGifts = async (list: BrideGift[]) => {
    if (!requireBrideLogin()) return;
    const added = list.find((item) => !gifts.some((current) => current.id === item.id));
    if (!added) return;
    try {
      const result = await requestJson('/api/bride/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: added.title,
          description: added.category,
          estimatedValue: added.value,
          image: added.imageUrl,
        }),
      });
      setGifts([...gifts, { ...added, id: String(result.gift.id) }]);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Erro ao salvar presente.');
    }
  };

  const updateEvents = async (list: BrideCalendarEvent[]) => {
    if (!requireBrideLogin()) return;
    const added = list.find((item) => !calendarEvents.some((current) => current.id === item.id));
    const removed = calendarEvents.find((item) => !list.some((current) => current.id === item.id));
    try {
      if (added) {
        const result = await requestJson('/api/bride/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: added.title,
            description: added.notes,
            eventType: added.type,
            location: added.location,
            startAt: `${added.date}T${added.time}:00`,
            reminderEnabled: added.notify,
          }),
        });
        setCalendarEvents([...calendarEvents, { ...added, id: String(result.event.id) }]);
      } else if (removed) {
        await requestJson(`/api/bride/events/${removed.id}`, { method: 'DELETE' });
        setCalendarEvents(list);
      }
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Erro ao salvar compromisso.');
    }
  };

  const saveBudget = async () => {
    if (!requireBrideLogin()) return;
    try {
      await requestJson('/api/bride/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalBudget: totalBudgetInput }),
      });
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Erro ao salvar orçamento.');
    }
  };

  const saveWeddingWebsite = async () => {
    if (!requireBrideLogin()) return;
    try {
      const result = await requestJson('/api/bride/wedding-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupleNames: siteNames,
          story: siteStory,
          weddingDate,
          ceremonyLocation: siteVenue,
          receptionLocation: siteAddress,
          isPublished: true,
          rsvpEnabled: true,
        }),
      });
      const publicSlug = result.website?.slug || encodeURIComponent(siteNames);
      await navigator.clipboard?.writeText(`${window.location.origin}/casal/${publicSlug}`);
      alert('Site salvo no MySQL e link copiado.');
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Erro ao salvar o site do casamento.');
    }
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
  const handleToggleChecklist = async (id: string) => {
    if (!requireBrideLogin()) return;
    try {
      const result = await requestJson(`/api/bride/tasks/${id}/complete`, { method: 'PATCH' });
      setChecklist((items) =>
        items.map((item) => item.id === id ? { ...item, completed: Boolean(result.task.isCompleted) } : item)
      );
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa.');
    }
  };

  // Toggle Inspiration Favorite
  const handleToggleInspirationFav = async (id: string) => {
    if (!requireBrideLogin()) return;
    const item = inspirations.find((inspiration) => inspiration.id === id);
    if (!item) return;
    try {
      if (item.favorited) {
        await requestJson(`/api/bride/favorites/inspirations/${id}`, { method: 'DELETE' });
      } else {
        await requestJson('/api/bride/favorites/inspirations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inspirationId: id,
            title: item.title,
            category: item.category,
            imageUrl: item.imageUrl,
          }),
        });
      }
      setInspirations((items) =>
        items.map((inspiration) =>
          inspiration.id === id
            ? {
                ...inspiration,
                favorited: !inspiration.favorited,
                likesCount: Math.max(0, inspiration.likesCount + (inspiration.favorited ? -1 : 1)),
              }
            : inspiration
        )
      );
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Erro ao atualizar favorito.');
    }
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

  const handleSelectQuizOption = async (styleChoice: string) => {
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
      if (requireBrideLogin()) {
        try {
          await requestJson('/api/bride/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              answersJson: nextAnswers,
              resultStyle: maxStyle,
              scoreJson: counts,
            }),
          });
        } catch (err) {
          setDataError(err instanceof Error ? err.message : 'Erro ao salvar o resultado do quiz.');
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {dataError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {dataError}
        </div>
      )}
      
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

          {/* Profile Completion Card */}
          <div className="bg-gradient-to-r from-rose-50 via-amber-50/50 to-white p-5 rounded-3xl border border-[#C88E9B]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#C88E9B] text-white rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                45%
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#5A4035] text-base">Complete o Perfil do seu Casamento</h3>
                <p className="text-xs text-stone-600">
                  Adicione o local exato, número de convidados e teto de orçamento para receber estimativas e propostas precisas dos estúdios.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-5 py-2.5 bg-[#5A4035] hover:bg-[#C88E9B] text-white font-bold text-xs rounded-xl transition-all shrink-0 shadow-xs"
            >
              Completar Perfil Agora →
            </button>
          </div>

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
                    const date = prompt('Data do compromisso (AAAA-MM-DD):', new Date().toISOString().slice(0, 10));
                    const time = prompt('Horário (HH:MM):', '09:00');
                    if (!date || !time) return;
                    const newEv: BrideCalendarEvent = {
                      id: String(Date.now()),
                      title,
                      type: 'Reunião com fotógrafo',
                      date,
                      time,
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
                onBlur={saveBudget}
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
                    const paidAmount = Number(prompt('Valor já pago (R$):', '0') || '0');
                    const dueDate = prompt('Data de vencimento (AAAA-MM-DD):', '') || '';
                    const newExp: BrideExpense = {
                      id: String(Date.now()),
                      category: 'Outros',
                      supplier,
                      amount,
                      paidAmount,
                      dueDate,
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
                    const phone = prompt('Telefone do convidado:', '') || '';
                    const family = prompt('Família ou grupo:', '') || '';
                    const companionCount = Number(prompt('Quantidade de acompanhantes:', '0') || '0');
                    const tableNumber = prompt('Mesa (opcional):', '') || '';
                    const newGuest: BrideGuest = {
                      id: String(Date.now()),
                      name,
                      phone,
                      family,
                      status: 'pendente',
                      companionCount,
                      tableNumber,
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
              {photoLocations.map((loc) => (
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
                  onClick={saveWeddingWebsite}
                  className="px-5 py-2.5 bg-[#C88E9B] text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                >
                  Salvar e Copiar Link
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
                    if (!userSession) setIsSavePromptOpen(true);
                    else alert('Seu planejamento já é salvo automaticamente na nuvem no MySQL!');
                  }}
                  className="px-5 py-2.5 bg-[#C7A86A] text-[#5A4035] hover:bg-white transition-all rounded-xl font-bold text-xs shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#5A4035]" />
                  <span>Salvar Planejamento</span>
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

      {/* SAVE PROMPT MODAL FOR UNAUTHENTICATED GUESTS */}
      {isSavePromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#C88E9B]/30 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FAF0F2] text-[#C88E9B] flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8 text-[#C88E9B]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-[#5A4035]">
                Salvar seu Planejamento
              </h3>
              <p className="text-sm text-stone-600 font-medium leading-relaxed">
                Crie sua conta gratuita para salvar seu planejamento e acessar de qualquer dispositivo.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setIsSavePromptOpen(false);
                  if (onNavigateRegister) onNavigateRegister();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#C88E9B] to-[#b07885] text-white font-bold text-sm rounded-xl shadow-md transition-all hover:opacity-95"
              >
                Criar conta grátis
              </button>

              <button
                onClick={() => {
                  setIsSavePromptOpen(false);
                  if (onNavigateLogin) onNavigateLogin();
                }}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-[#5A4035] font-bold text-xs rounded-xl transition-all"
              >
                Já tenho uma conta
              </button>

              <button
                onClick={() => setIsSavePromptOpen(false)}
                className="text-xs text-stone-400 hover:text-stone-600 block mx-auto pt-1 font-medium"
              >
                Continuar explorando como visitante
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Wedding Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#C88E9B]/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#5A4035]/10 pb-3">
              <h3 className="text-xl font-serif font-bold text-[#5A4035]">Completar Perfil do Casal</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Data do Casamento:</label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Local / Cidade da Cerimônia:</label>
                <input
                  type="text"
                  value={siteVenue}
                  onChange={(e) => setSiteVenue(e.target.value)}
                  placeholder="Ex: Fazenda Santa Maria, Piracicaba - SP"
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Estimativa de Convidados:</label>
                <input
                  type="number"
                  value={simGuests}
                  onChange={(e) => setSimGuests(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A4035] mb-1">Teto Global de Orçamento (R$):</label>
                <input
                  type="number"
                  step={1000}
                  value={totalBudgetInput}
                  onChange={(e) => setTotalBudgetInput(Number(e.target.value))}
                  onBlur={saveBudget}
                  className="w-full p-2.5 bg-[#FAF5F0] border border-[#5A4035]/20 rounded-xl font-bold text-emerald-800"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (requireBrideLogin()) {
                    requestJson('/api/bride/profile', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ weddingDate, ceremonyLocation: siteVenue })
                    })
                      .then(() => setIsEditModalOpen(false))
                      .catch((err) =>
                        setDataError(err instanceof Error ? err.message : 'Erro ao salvar perfil.')
                      );
                  }
                }}
                className="px-6 py-2 bg-[#C88E9B] hover:bg-[#b07582] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Salvar Perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
