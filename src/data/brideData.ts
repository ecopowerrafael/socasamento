import {
  BrideGuest,
  BrideGift,
  BrideExpense,
  BrideCalendarEvent,
  BrideInspiration,
  BridePhotoLocation,
  BrideGamificationBadge,
} from '../types';

export const INITIAL_BRIDE_GUESTS: BrideGuest[] = [
  { id: '1', name: 'Camila Silva', phone: '(19) 99876-5432', family: 'Família Silva (Noiva)', status: 'confirmado', companionCount: 2, tableNumber: 'Mesa 1' },
  { id: '2', name: 'Fernando Oliveira', phone: '(19) 98765-4321', family: 'Família Oliveira (Noivo)', status: 'confirmado', companionCount: 1, tableNumber: 'Mesa 1' },
  { id: '3', name: 'Rodrigo Santos', phone: '(11) 97123-4567', family: 'Padrinhos', status: 'pendente', companionCount: 1, tableNumber: 'Mesa 2' },
  { id: '4', name: 'Ana Paula Costa', phone: '(19) 99111-2233', family: 'Família Costa', status: 'recusado', companionCount: 0, tableNumber: 'Mesa 3' },
  { id: '5', name: 'Marcos & Bruna Souza', phone: '(19) 98888-7766', family: 'Amigos Faculdade', status: 'confirmado', companionCount: 2, tableNumber: 'Mesa 4' },
  { id: '6', name: 'Juliana Paes', phone: '(19) 99222-3344', family: 'Madrinhas', status: 'confirmado', companionCount: 1, tableNumber: 'Mesa 2' },
  { id: '7', name: 'Roberto Carlos', phone: '(11) 98877-6655', family: 'Família Silva (Noiva)', status: 'pendente', companionCount: 1, tableNumber: 'Mesa 5' },
];

export const INITIAL_BRIDE_GIFTS: BrideGift[] = [
  { id: '1', title: 'Aparelho de Jantar 42 Peças Porcelana', value: 850, purchased: true, givenBy: 'Tia Maria Silva', category: 'Cozinha', imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=400' },
  { id: '2', title: 'Jogo de Panelas Inox Fundo Triplo', value: 1200, purchased: false, category: 'Cozinha', imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=400' },
  { id: '3', title: 'Cafeteira Nespresso Essenza Mini', value: 490, purchased: true, givenBy: 'Lucas & Bruna', category: 'Eletros', imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebd02f2a888?auto=format&fit=crop&q=80&w=400' },
  { id: '4', title: 'Geladeira Inverter Frost Free 450L', value: 4200, purchased: false, category: 'Eletros', imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&q=80&w=400' },
  { id: '5', title: 'Air Fryer Digital Stainless 5.5L', value: 680, purchased: true, givenBy: 'Pedro e Júlia', category: 'Eletros', imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&q=80&w=400' },
  { id: '6', title: 'Cota de Lua de Mel - Jantar Romântico em Paris', value: 500, purchased: false, category: 'Lua de Mel', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400' },
];

export const INITIAL_BRIDE_EXPENSES: BrideExpense[] = [
  { id: '1', category: 'Buffet & Espaço', supplier: 'Fazenda & Buffet Roseiras', amount: 28000, paidAmount: 18000, dueDate: '2026-09-10' },
  { id: '2', category: 'Fotografia & Filme', supplier: 'Estúdio Lucas Perez Fotografia', amount: 9600, paidAmount: 4800, dueDate: '2026-10-05' },
  { id: '3', category: 'Vestido da Noiva', supplier: 'Ateliê Haute Couture Noivas', amount: 8000, paidAmount: 8000, dueDate: '2026-06-01' },
  { id: '4', category: 'Decoração & Floricultura', supplier: 'Flor de Lis Eventos', amount: 12000, paidAmount: 6000, dueDate: '2026-08-20' },
  { id: '5', category: 'Música, Banda & DJ', supplier: 'Som & Luz Eventos', amount: 6400, paidAmount: 3200, dueDate: '2026-10-01' },
  { id: '6', category: 'Cerimonial & Assessoria', supplier: 'Ana Mello Cerimonial', amount: 6400, paidAmount: 3200, dueDate: '2026-11-01' },
  { id: '7', category: 'Convites & Papelaria', supplier: 'Papel com Amor Design', amount: 1600, paidAmount: 1600, dueDate: '2026-05-15' },
  { id: '8', category: 'Doces & Bolo', supplier: 'Dolce Vita Confeitaria', amount: 4000, paidAmount: 2000, dueDate: '2026-09-25' },
];

export const INITIAL_CALENDAR_EVENTS: BrideCalendarEvent[] = [
  { id: '1', title: 'Prova Final do Vestido', type: 'Prova do vestido', date: '2026-08-15', time: '14:00', location: 'Ateliê Haute Couture', notify: true, notes: 'Levar os sapatos do casamento' },
  { id: '2', title: 'Degustação de Doces e Bolo', type: 'Degustação', date: '2026-08-28', time: '19:30', location: 'Dolce Vita Confeitaria', notify: true, notes: 'Escolher os 6 sabores de finos' },
  { id: '3', title: 'Reunião do Roteiro Fotográfico', type: 'Reunião com fotógrafo', date: '2026-09-10', time: '16:00', location: 'Estúdio Lucas Perez', notify: true, notes: 'Definir lista de fotos de família' },
  { id: '4', title: 'Chá de Panela com Madrinhas', type: 'Chá de panela', date: '2026-10-18', time: '15:00', location: 'Salão do Condomínio', notify: true, notes: 'Tema Tropical Elegante' },
  { id: '5', title: 'Assinatura do Casamento Civil', type: 'Casamento civil', date: '2026-11-10', time: '10:00', location: 'Cartório de Registro Civil', notify: true, notes: 'Levar testemunhas e documentos' },
  { id: '6', title: 'GRANDE DIA: O Casamento!', type: 'Outros', date: '2026-11-15', time: '15:30', location: 'Fazenda Roseiras', notify: true, notes: 'Nosso dia inesquecível! ❤️' },
];

export const INITIAL_INSPIRATIONS: BrideInspiration[] = [
  { id: '1', title: 'Decoração Boho Chic com Luzes de Gambiarra', category: 'decoração', imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800', likesCount: 342, favorited: true },
  { id: '2', title: 'Vestido Minimalista em Seda com Decote Traseiro', category: 'vestido', imageUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=800', likesCount: 512, favorited: true },
  { id: '3', title: 'Ensaio Pré-Wedding na Golden Hour no Campo', category: 'fotografia', imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800', likesCount: 689, favorited: false },
  { id: '4', title: 'Maquiagem Glow Iluminada Natural para Noivas', category: 'maquiagem', imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800', likesCount: 418, favorited: true },
  { id: '5', title: 'Bolo Botânico Rústico com Flores Naturais', category: 'bolo', imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&q=80&w=800', likesCount: 295, favorited: false },
  { id: '6', title: 'Mesa de Doces com Arranjos Florais Orgânicos', category: 'decoração', imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800', likesCount: 480, favorited: false },
  { id: '7', title: 'Buquê Desestruturado Eucalipto e Rosas Nude', category: 'decoração', imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=800', likesCount: 530, favorited: true },
  { id: '8', title: 'Penteado Semi-Preso com Trança e Flores', category: 'maquiagem', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800', likesCount: 390, favorited: false },
];

export const PHOTO_LOCATIONS: BridePhotoLocation[] = [
  {
    id: 'loc-1',
    name: 'Fazenda Roseiras e Lago Imperial',
    category: 'Fazenda',
    city: 'Piracicaba',
    state: 'SP',
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    idealTime: '16:30 às 18:00 (Golden Hour)',
    needAuthorization: true,
    feeInfo: 'R$ 250 taxa de locação do espaço',
    description: 'Casarão colonial do século XIX com fileira de palmeiras imperiais, deck suspenso sobre o lago e gramado infinito.',
    address: 'Rodovia Piracicaba - Anhumas, km 12',
  },
  {
    id: 'loc-2',
    name: 'Parque e Cachoeira das Águas Claras',
    category: 'Cachoeira',
    city: 'Brotas',
    state: 'SP',
    coverImage: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80&w=800',
    idealTime: '09:00 às 11:30 (Luz filtrada entre árvores)',
    needAuthorization: true,
    feeInfo: 'R$ 35 por pessoa (ingresso do parque)',
    description: 'Queda d’água límpida de 18 metros cercada por mata atlântica preservada, pontes de madeira rústica e pedras esculpidas.',
    address: 'Estrada do Parque, km 5 - Brotas',
  },
  {
    id: 'loc-3',
    name: 'Centro Histórico & Engenho Central',
    category: 'Centro histórico',
    city: 'Piracicaba',
    state: 'SP',
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    idealTime: '16:00 às 17:45',
    needAuthorization: false,
    feeInfo: 'Acesso público e gratuito',
    description: 'Arquitetura industrial em tijolo aparente do século XIX, passarela metálica sobre o Rio Piracicaba e alamedas sombreadas.',
    address: 'Av. Maurice Allain, 454 - Piracicaba',
  },
  {
    id: 'loc-4',
    name: 'Praia de Maresias e Falésias do Pôr do Sol',
    category: 'Praia',
    city: 'São Sebastião',
    state: 'SP',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    idealTime: '17:00 às 18:15',
    needAuthorization: false,
    feeInfo: 'Público livre',
    description: 'Areias brancas, vegetação de restinga e rochedos dramáticos onde as ondas batem com visual cinematográfico no fim de tarde.',
    address: 'Canto do Moreira - Maresias',
  },
  {
    id: 'loc-5',
    name: 'Campos de Lavanda & Girassóis de Holambra',
    category: 'Campo',
    city: 'Holambra',
    state: 'SP',
    coverImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800',
    idealTime: '15:30 às 17:30',
    needAuthorization: true,
    feeInfo: 'R$ 180 por casal + fotógrafo',
    description: 'Hectares de lavandas roxas e girassóis amarelos em florada contínua, estufas holandesas e moinhos de vento.',
    address: 'Rota dos Flores - Holambra',
  },
  {
    id: 'loc-6',
    name: 'Mirante do Lago & Píer de Madeira',
    category: 'Lago',
    city: 'Americana',
    state: 'SP',
    coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800',
    idealTime: '06:30 (Amanhecer com névoa) ou 17:00',
    needAuthorization: false,
    feeInfo: 'Livre',
    description: 'Espelho d’água calmo refletindo o céu do interior, píer estendido em madeira maciça com barcos vintage.',
    address: 'Praia dos Namorados - Americana',
  },
];

export const INITIAL_TIMELINE_ITEMS = [
  { id: '1', time: '08:00', title: 'Chegada ao Camarim da Noiva', desc: 'Início dos preparativos de cabelo, maquiagem e hidratação com a equipe de beleza.', icon: 'Sparkles' },
  { id: '2', time: '11:00', title: 'Chegada da Equipe de Fotografia e Filme', desc: 'Início do registro do Making Of da Noiva, vestuário, detalhes dos convites e anéis.', icon: 'Camera' },
  { id: '3', time: '13:00', title: 'Making Of do Noivo & Padrinhos', desc: 'Registro do noivo se vestindo, brinde com os padrinhos e momentos descontraídos.', icon: 'UserCheck' },
  { id: '4', time: '14:15', title: 'Vestir o Vestido de Noiva', desc: 'Mãe e madrinhas ajudam a fechar o vestido e colocar o véu. Fotos solo emocionantes.', icon: 'Heart' },
  { id: '5', time: '15:00', title: 'Deslocamento para o Local da Cerimônia', desc: 'Veículo da noiva parte rumo à fazenda/igreja. Chegada dos convidados ao local.', icon: 'Car' },
  { id: '6', time: '15:30', title: 'Início da Cerimônia Religiosa / Celebrante', desc: 'Entrada dos padrinhos, noivo com sua mãe, floristas e a emocionante entrada da noiva.', icon: 'Music' },
  { id: '7', time: '16:30', title: 'Troca de Alianças & O Grande Beijo', desc: 'Votos personalizados do casal, bênção das alianças e saída festiva com chuva de pétalas.', icon: 'Sparkles' },
  { id: '8', time: '17:00', title: 'Ensaio Fotográfico na Golden Hour', desc: 'Fotos dos recém-casados com luz suave do pôr do sol, além de fotos formais de família.', icon: 'Sun' },
  { id: '9', time: '18:00', title: 'Entrada na Festa, Brinde & Corte do Bolo', desc: 'Casal é recebido com aplausos na recepção, fazem o brinde e o corte simbólico do bolo.', icon: 'Wine' },
  { id: '10', time: '18:30', title: 'Valsa dos Noivos & Abertura da Pista de Dança', desc: 'Primeira dança do casal sob chuva de faíscas frias (cold sparks) e início do DJ/Banda.', icon: 'PartyPopper' },
];

export const GAMIFICATION_BADGES: BrideGamificationBadge[] = [
  { id: 'badge-1', title: 'Primeiros Passos', icon: 'Footprints', unlocked: true, description: 'Definiu a data do casamento e iniciou o planejamento no portal.' },
  { id: 'badge-2', title: 'Casamento Organizado', icon: 'Users', unlocked: true, description: 'Cadastrou mais de 10 convidados e organizou por famílias.' },
  { id: 'badge-3', title: 'Todos Fornecedores Contratados', icon: 'CheckCircle2', unlocked: true, description: 'Lançou os contratos de buffet, fotografia, vestido e decor.' },
  { id: 'badge-4', title: 'Checklist Completo', icon: 'CheckSquare', unlocked: false, progressPercent: 68, description: 'Concluiu mais de 60% das tarefas essenciais do checklist.' },
  { id: 'badge-5', title: 'Orçamento Finalizado', icon: 'Calculator', unlocked: false, progressPercent: 85, description: 'Distribuiu o orçamento ideal e cadastrou os valores pagos.' },
];
