import { Photographer, RecentWedding, BlogArticle, StateData, CitySEOData, ChecklistItem } from '../types';

export const BRAZIL_STATES: StateData[] = [
  { uf: 'SP', name: 'São Paulo', citiesCount: 645, photographersCount: 1840, topCities: ['São Paulo', 'Campinas', 'Piracicaba', 'Sorocaba', 'Osasco', 'Ribeirão Preto', 'Santos'] },
  { uf: 'RJ', name: 'Rio de Janeiro', citiesCount: 92, photographersCount: 920, topCities: ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Búzios', 'Campos dos Goytacazes'] },
  { uf: 'PR', name: 'Paraná', citiesCount: 399, photographersCount: 610, topCities: ['Curitiba', 'Londrina', 'Maringá', 'Cascavel', 'Ponta Grossa'] },
  { uf: 'MG', name: 'Minas Gerais', citiesCount: 853, photographersCount: 890, topCities: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Ouro Preto', 'Tiradentes'] },
  { uf: 'SC', name: 'Santa Catarina', citiesCount: 295, photographersCount: 540, topCities: ['Florianópolis', 'Balneário Camboriú', 'Joinville', 'Blumenau'] },
  { uf: 'RS', name: 'Rio Grande do Sul', citiesCount: 497, photographersCount: 480, topCities: ['Porto Alegre', 'Gramado', 'Caxias do Sul', 'Pelotas'] },
  { uf: 'BA', name: 'Bahia', citiesCount: 417, photographersCount: 410, topCities: ['Salvador', 'Trancoso', 'Arraial d\'Ajuda', 'Praia do Forte', 'Feira de Santana'] },
  { uf: 'DF', name: 'Distrito Federal', citiesCount: 1, photographersCount: 320, topCities: ['Brasília'] },
  { uf: 'PE', name: 'Pernambuco', citiesCount: 185, photographersCount: 310, topCities: ['Recife', 'Fernando de Noronha', 'Olinda', 'Caruaru'] },
  { uf: 'GO', name: 'Goiás', citiesCount: 246, photographersCount: 280, topCities: ['Goiânia', 'Pirenópolis', 'Anápolis'] },
  { uf: 'CE', name: 'Ceará', citiesCount: 184, photographersCount: 260, topCities: ['Fortaleza', 'Jericoacoara', 'Juazeiro do Norte'] },
];

export const MOCK_PHOTOGRAPHERS: Photographer[] = [
  {
    id: 'p1',
    slug: 'fotografo-perez',
    name: 'Eduardo Perez',
    studioName: 'Perez Fotografia de Casamento',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
    city: 'Piracicaba',
    state: 'SP',
    neighborhood: 'Centro',
    rating: 4.9,
    reviewCount: 48,
    priceStartingFrom: 3800,
    priceCategory: 'R$ 2.000 a R$ 5.000',
    styles: ['Fine Art', 'Documental', 'Boho'],
    deliverables: ['Foto', 'Vídeo', 'Drone', 'Álbum', 'Making Of', 'Same Day Edit'],
    categories: ['Fotógrafos', 'Foto e Filme', 'Drone', 'Pré Wedding', 'Mini Wedding'],
    badges: ['Verificado', 'Top Avaliado', 'Premium'],
    yearsExperience: 11,
    weddingsCompleted: 240,
    awardsCount: 14,
    description: 'Especialista em capturar emoções autênticas e luz natural em casamentos no campo, mini weddings e celebrações ao ar livre.',
    bioFull: 'Há mais de 11 anos registramos histórias de amor com um olhar poético e sensível. Nossa abordagem mistura o estilo Fine Art com o fotojornalismo espontâneo. Acreditamos que a fotografia de casamento deve transmitir a verdade e o carinho vividos naquele dia único.',
    phone: '(19) 99876-5432',
    whatsapp: '5519998765432',
    instagram: '@perezfotografia',
    website: 'https://perezfotografia.com.br',
    email: 'contato@perezfotografia.com.br',
    address: 'Av. Independência, 1200 - Piracicaba, SP',
    featuredInHome: true,
    plan: 'Premium',
    faqs: [
      { question: 'Com quanto tempo de antecedência devo reservar?', answer: 'Recomendamos entre 8 a 12 meses antes da data do casamento para garantir a disponibilidade da agenda.' },
      { question: 'Vocês realizam casamentos fora de Piracicaba?', answer: 'Sim! Viajamos por todo o estado de SP e Brasil para Destination Weddings e Mini Weddings.' },
      { question: 'Quantas fotos são entregues?', answer: 'Em média de 600 a 1.000 fotos tratadas em alta resolução sem marca d\'água.' }
    ],
    gallery: [
      { id: 'g1', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', caption: 'Cerimônia ao entardecer no campo', category: 'Cerimônia', featured: true },
      { id: 'g2', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80', caption: 'Ensaio Pré Wedding na fazenda', category: 'Pré Wedding', featured: true },
      { id: 'g3', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', caption: 'Making Of da noiva no camarim', category: 'Making Of' },
      { id: 'g4', url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80', caption: 'Primeira dança dos noivos com luzes', category: 'Festa' },
      { id: 'g5', url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80', caption: 'Vista aérea do altar por drone', category: 'Drone' },
      { id: 'g6', url: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1200&q=80', caption: 'Álbum panorâmico em linho e madeira', category: 'Álbuns' }
    ],
    videos: [
      { id: 'v1', title: 'Teaser Casamento Marina & Gustavo em Piracicaba', thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', type: 'YouTube' }
    ],
    packages: [
      {
        id: 'pk1',
        name: 'Essencial',
        price: 3800,
        description: 'Ideal para mini weddings e cerimônias intimistas até 80 convidados.',
        features: ['6 horas de cobertura fotográfica', '1 Fotógrafo principal', 'Entrega de 500+ fotos tratadas em galeria online', 'Pré Wedding de 2 horas em Piracicaba'],
        deliverables: ['Foto', 'Pré Wedding']
      },
      {
        id: 'pk2',
        name: 'Completo Destaque',
        price: 6500,
        popular: true,
        description: 'O pacote mais escolhido pelos noivos. Cobertura total com vídeo e drone.',
        features: ['Cobertura sem limite de horas', '2 Fotógrafos + 2 Cinegrafistas', 'Ensaio Pré Wedding e Making Of completo', 'Vídeo Teaser 3min + Filme 15min', 'Drone em 4K', 'Álbum Luxo 30x30cm com 40 páginas'],
        deliverables: ['Foto', 'Vídeo', 'Drone', 'Álbum', 'Making Of', 'Pré Wedding']
      },
      {
        id: 'pk3',
        name: 'Signature Fine Art',
        price: 9800,
        description: 'Experiência máxima para casamentos marcantes e destination weddings.',
        features: ['Equipe completa com 3 fotógrafos e 3 cinegrafistas', 'Same Day Edit na festa', 'Caixa personalizada de madeira com pen-drive e 50 fotos impressas', '2 Álbuns menores para os pais', 'Drone com piloto homologado ANAC'],
        deliverables: ['Foto', 'Vídeo', 'Drone', 'Same Day Edit', 'Álbum', 'Making Of', 'Pré Wedding', 'Pós Wedding']
      }
    ],
    reviews: [
      {
        id: 'r1',
        coupleName: 'Camila & Fernando',
        date: '14 de Maio de 2025',
        weddingLocation: 'Espaço Terras de Clara - Piracicaba',
        rating: 5,
        comment: 'O Eduardo e sua equipe foram espetaculares! Não fomos aqueles noivos tímidos por causa do carinho dele. As fotos parecem pinturas. Todo mundo na festa elogiou o profissionalismo!',
        verifiedBooking: true,
        photographerReply: 'Muito obrigado queridos Camila e Fernando! Foi uma honra gigantesca contar a história desse dia iluminado com vocês.'
      },
      {
        id: 'r2',
        coupleName: 'Juliana & Rodrigo',
        date: '20 de Novembro de 2024',
        weddingLocation: 'Quinta das Flores',
        rating: 5,
        comment: 'Recebemos a galeria online antes do prazo e choramos de emoção ao rever a cerimônia! O álbum impresso é impecável.',
        verifiedBooking: true
      }
    ]
  },
  {
    id: 'p2',
    slug: 'lumina-foto-filme',
    name: 'Lumina Studio (Juliana & Thiago)',
    studioName: 'Lumina Foto & Filme',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80',
    city: 'São Paulo',
    state: 'SP',
    neighborhood: 'Pinheiros',
    rating: 5.0,
    reviewCount: 62,
    priceStartingFrom: 7200,
    priceCategory: 'R$ 5.000 a R$ 10.000',
    styles: ['Editorial', 'Luxury', 'Fine Art', 'Fotojornalismo'],
    deliverables: ['Foto', 'Vídeo', 'Drone', 'Álbum', 'Making Of', 'Same Day Edit'],
    categories: ['Fotógrafos', 'Foto e Filme', 'Destination Wedding', 'Casamento Religioso'],
    badges: ['Verificado', 'Top Avaliado', 'Premium'],
    yearsExperience: 14,
    weddingsCompleted: 380,
    awardsCount: 22,
    description: 'Estúdio de fotografia e cinema de casamento em SP especializado em casamentos elegantes, sofisticados e Destination Weddings.',
    bioFull: 'A Lumina nasceu do sonho de unir alta moda, estética cinematográfica e emoção espontânea. Atendemos aos bairros nobres de São Paulo (Pinheiros, Moema, Jardins) e Destination Weddings na praia e na serra.',
    phone: '(11) 98765-4321',
    whatsapp: '5511987654321',
    instagram: '@luminafotofilme',
    website: 'https://luminafotofilme.com.br',
    email: 'contato@luminafotofilme.com.br',
    address: 'Rua Oscar Freire, 800 - Jardins, São Paulo - SP',
    featuredInHome: true,
    plan: 'Premium',
    faqs: [
      { question: 'Atendem fora da cidade de São Paulo?', answer: 'Sim, realizamos casamentos em Ilhabela, Trancoso, Campos do Jordão e no exterior.' },
      { question: 'Oferecem filmagem em 4K com Drone?', answer: 'Sim! Nosso time conta com cinegrafista dedicado e piloto de drone com licença.' }
    ],
    gallery: [
      { id: 'lg1', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80', caption: 'Ensaio editorial nos Jardins SP', category: 'Pré Wedding', featured: true },
      { id: 'lg2', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', caption: 'Entrada na Igreja Nossa Senhora do Brasil', category: 'Cerimônia', featured: true },
      { id: 'lg3', url: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1200&q=80', caption: 'Festa no Palácio Tangará', category: 'Festa' }
    ],
    videos: [],
    packages: [
      {
        id: 'lpk1',
        name: 'Lumina Luxury Wedding',
        price: 8500,
        popular: true,
        description: 'Cobertura fotográfica e cinematográfica premium com iluminação de estúdio portátil.',
        features: ['2 Fotógrafos seniores + 2 videomakers', 'Cobertura ilimitada até o fim da festa', 'Filme de 20min em 4K + Teaser Instagram', 'Álbum em couro legítimo 35x35cm'],
        deliverables: ['Foto', 'Vídeo', 'Drone', 'Álbum', 'Making Of']
      }
    ],
    reviews: [
      {
        id: 'lr1',
        coupleName: 'Beatriz & Lucas',
        date: '10 de Janeiro de 2026',
        weddingLocation: 'Igreja da Consolação / Casa das Caldeiras SP',
        rating: 5,
        comment: 'Extremamente elegantes! O Thiago e a Ju pareciam convidados da família e captaram detalhes surreais da nossa festa.',
        verifiedBooking: true
      }
    ]
  },
  {
    id: 'p3',
    slug: 'marcos-vinicius-fotografia',
    name: 'Marcos Vinicius',
    studioName: 'Marcos Vinicius Fotografia',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=80',
    city: 'Curitiba',
    state: 'PR',
    neighborhood: 'Batel',
    rating: 4.8,
    reviewCount: 35,
    priceStartingFrom: 2900,
    priceCategory: 'R$ 2.000 a R$ 5.000',
    styles: ['Documental', 'Lifestyle', 'Fotojornalismo'],
    deliverables: ['Foto', 'Making Of', 'Pré Wedding', 'Álbum'],
    categories: ['Fotógrafos', 'Pré Wedding', 'Casamento Civil', 'Mini Wedding'],
    badges: ['Verificado', 'Top Avaliado'],
    yearsExperience: 8,
    weddingsCompleted: 160,
    awardsCount: 6,
    description: 'Fotografia documental autêntica e sem poses forçadas para casais modernos em Curitiba e região.',
    bioFull: 'Especialista em captar olhares cúmplices, gargalhadas sinceras e momentos espontâneos. Se você busca fotos com alma e verdade, sem clichês de poses engessadas, este é o lugar certo.',
    phone: '(41) 99123-4567',
    whatsapp: '5541991234567',
    instagram: '@marcosv.foto',
    website: 'https://marcosviniciusfotografia.com.br',
    email: 'marcos@marcosvinicius.com',
    featuredInHome: true,
    plan: 'Destaque',
    faqs: [
      { question: 'Qual é o seu estilo?', answer: 'Meu foco é 100% fotojornalismo de casamento, registrando as emoções de forma natural.' }
    ],
    gallery: [
      { id: 'mg1', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80', caption: 'Etroca de olhares no altar', category: 'Cerimônia', featured: true },
      { id: 'mg2', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', caption: 'Sorrisos espontâneos no making of', category: 'Making Of' }
    ],
    videos: [],
    packages: [
      {
        id: 'mpk1',
        name: 'Pacote Espontâneo',
        price: 3200,
        popular: true,
        description: 'Cobertura completa de cerimônia e recepção com foco na emoção do dia.',
        features: ['8h de cobertura', 'Galeria online privada', 'Ensaio casal antes da data', 'Pendrive em estojo sob medida'],
        deliverables: ['Foto', 'Making Of', 'Pré Wedding']
      }
    ],
    reviews: [
      {
        id: 'mr1',
        coupleName: 'Patricia & Gabriel',
        date: '05 de Dezembro de 2025',
        weddingLocation: 'Castelo do Batel - Curitiba',
        rating: 5,
        comment: 'O Marcos nos deixou super tranquilos! Nem percebemos que estávamos sendo fotografados e o resultado foi emocionante.',
        verifiedBooking: true
      }
    ]
  },
  {
    id: 'p4',
    slug: 'carolina-mendes-boho',
    name: 'Carolina Mendes',
    studioName: 'Carol Mendes Boho & Beach Weddings',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=80',
    city: 'Campinas',
    state: 'SP',
    neighborhood: 'Cambuí',
    rating: 4.9,
    reviewCount: 41,
    priceStartingFrom: 4200,
    priceCategory: 'R$ 2.000 a R$ 5.000',
    styles: ['Boho', 'Fine Art', 'Minimalista', 'Lifestyle'],
    deliverables: ['Foto', 'Drone', 'Álbum', 'Pré Wedding', 'Pós Wedding'],
    categories: ['Fotógrafos', 'Pré Wedding', 'Destination Wedding', 'Mini Wedding'],
    badges: ['Verificado', 'Top Avaliado', 'Premium'],
    yearsExperience: 9,
    weddingsCompleted: 190,
    awardsCount: 9,
    description: 'Sensibilidade de tons quentes e poéticos para casamentos no campo, praia, celeiro e minicasamentos.',
    bioFull: 'Amo a luz dourada do por do sol, os vestidos esvoaçantes e a vibe intimista de celebrações afetivas. Trabalho com edição com tons terrosos quentes e aconchegantes.',
    phone: '(19) 98811-2233',
    whatsapp: '5519988112233',
    instagram: '@carolmendesfoto',
    website: 'https://carolmendesfoto.com.br',
    email: 'contato@carolmendesfoto.com.br',
    featuredInHome: true,
    plan: 'Premium',
    faqs: [
      { question: 'Faz ensaio pós-wedding na praia?', answer: 'Com certeza! Adoro ensaios ao amanhecer ou entardecer no litoral.' }
    ],
    gallery: [
      { id: 'cg1', url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80', caption: 'Casamento Boho ao ar livre em Holambra', category: 'Cerimônia', featured: true }
    ],
    videos: [],
    packages: [
      {
        id: 'cpk1',
        name: 'Boho Sunset',
        price: 4900,
        popular: true,
        description: 'Pacote completo para casamento ao ar livre com ensaio Pré-Wedding incluso.',
        features: ['Cobertura de cerimônia e recepção', 'Fotos drone do local', 'Álbum revestido em linho cru', 'Até 700 fotos editadas'],
        deliverables: ['Foto', 'Drone', 'Álbum', 'Pré Wedding']
      }
    ],
    reviews: [
      {
        id: 'cr1',
        coupleName: 'Fernanda & Diego',
        date: '18 de Setembro de 2025',
        weddingLocation: 'Fazenda Vila Rica - Itatiba',
        rating: 5,
        comment: 'As fotos da Carol têm uma magia surreal! A luz parecia de filme. Recomendo de olhos fechados!',
        verifiedBooking: true
      }
    ]
  },
  {
    id: 'p5',
    slug: 'rafael-alves-fotografia',
    name: 'Rafael Alves',
    studioName: 'Rafael Alves Wedding Photography',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=80',
    city: 'Sorocaba',
    state: 'SP',
    rating: 4.7,
    reviewCount: 29,
    priceStartingFrom: 1950,
    priceCategory: 'Até R$ 2.000',
    styles: ['Clássico', 'Documental'],
    deliverables: ['Foto', 'Álbum', 'Making Of'],
    categories: ['Fotógrafos', 'Casamento Civil', 'Casamento Religioso'],
    badges: ['Verificado'],
    yearsExperience: 6,
    weddingsCompleted: 110,
    awardsCount: 2,
    description: 'Fotografia de casamento acessível de alta qualidade em Sorocaba, Itu, Salto e região.',
    bioFull: 'Oferecemos orçamentos justos com pontualidade e dedicação absoluta ao casal, mantendo a excelência fotográfica.',
    phone: '(15) 99777-8899',
    whatsapp: '5515997778899',
    instagram: '@rafaelalvesfotofest',
    website: 'https://rafaelalvesfoto.com.br',
    email: 'contato@rafaelalvesfoto.com.br',
    featuredInHome: false,
    plan: 'Gratuito',
    faqs: [],
    gallery: [
      { id: 'rg1', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80', caption: 'Beijo dos noivos na saída da igreja', category: 'Cerimônia', featured: true }
    ],
    videos: [],
    packages: [
      {
        id: 'rpk1',
        name: 'Plano Econômico',
        price: 1950,
        description: 'Ideal para orçamentos enxutos e cerimônias religiosas/civis.',
        features: ['4h de cobertura', 'Galeria digital com 300 fotos tratadas', 'Pen-drive com alta resolução'],
        deliverables: ['Foto']
      }
    ],
    reviews: []
  },
  {
    id: 'p6',
    slug: 'vinicius-e-thais-cinema',
    name: 'Vinicius & Thaís',
    studioName: 'Studio V&T Wedding Cinema',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80',
    city: 'Osasco',
    state: 'SP',
    rating: 4.9,
    reviewCount: 38,
    priceStartingFrom: 3400,
    priceCategory: 'R$ 2.000 a R$ 5.000',
    styles: ['Fine Art', 'Editorial', 'Documental'],
    deliverables: ['Foto', 'Vídeo', 'Drone', 'Same Day Edit'],
    categories: ['Fotógrafos', 'Foto e Filme', 'Drone', 'Pós Wedding'],
    badges: ['Verificado', 'Top Avaliado'],
    yearsExperience: 7,
    weddingsCompleted: 145,
    awardsCount: 5,
    description: 'Dupla dinâmica especializada em fotos marcantes e vídeos estilo cinema de casamento na Grande SP.',
    bioFull: 'Acreditamos na sinergia perfeita entre fotografia e filme de casamento, com narrativa moderna e trilha sonora emocionante.',
    phone: '(11) 97700-1122',
    whatsapp: '5511977001122',
    instagram: '@vetweddingcinema',
    website: 'https://vetwedding.com.br',
    email: 'contato@vetwedding.com.br',
    featuredInHome: true,
    plan: 'Destaque',
    faqs: [],
    gallery: [
      { id: 'vg1', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80', caption: 'Recepção iluminada e romântica', category: 'Festa', featured: true }
    ],
    videos: [],
    packages: [],
    reviews: []
  }
];

export const RECENT_WEDDINGS: RecentWedding[] = [
  {
    id: 'w1',
    slug: 'casamento-marina-e-gustavo-piracicaba',
    title: 'Casamento ao Por do Sol de Marina & Gustavo',
    couple: 'Marina & Gustavo',
    date: '12 de Maio de 2025',
    city: 'Piracicaba',
    state: 'SP',
    venue: 'Espaço Terras de Clara',
    photographerId: 'p1',
    photographerName: 'Eduardo Perez',
    photographerSlug: 'fotografo-perez',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80'
    ],
    story: 'Um casamento emocionante ao ar livre no interior paulista com luz natural incrível, tons pastéis e festa animada até de madrugada.',
    style: 'Fine Art'
  },
  {
    id: 'w2',
    slug: 'casamento-beatriz-e-lucas-sao-paulo',
    title: 'Mini Wedding Elegante nos Jardins: Beatriz & Lucas',
    couple: 'Beatriz & Lucas',
    date: '10 de Janeiro de 2026',
    city: 'São Paulo',
    state: 'SP',
    venue: 'Palácio Tangará',
    photographerId: 'p2',
    photographerName: 'Lumina Foto & Filme',
    photographerSlug: 'lumina-foto-filme',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1200&q=80'
    ],
    story: 'Celebração intimista com 90 convidados nos Jardins, marcada por arranjos florais orgânicos e clima acolhedor.',
    style: 'Luxury'
  },
  {
    id: 'w3',
    slug: 'casamento-patricia-e-gabriel-curitiba',
    title: 'Casamento Clássico no Castelo do Batel: Patricia & Gabriel',
    couple: 'Patricia & Gabriel',
    date: '05 de Dezembro de 2025',
    city: 'Curitiba',
    state: 'PR',
    venue: 'Castelo do Batel',
    photographerId: 'p3',
    photographerName: 'Marcos Vinicius',
    photographerSlug: 'marcos-vinicius-fotografia',
    coverImage: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80'
    ],
    story: 'A arquitetura imponente do Castelo do Batel serviu como cenário para um sim repleto de romantismo e momentos espontâneos.',
    style: 'Documental'
  },
  {
    id: 'w4',
    slug: 'casamento-fernanda-e-diego-campinas',
    title: 'Casamento Boho Chic na Fazenda: Fernanda & Diego',
    couple: 'Fernanda & Diego',
    date: '18 de Setembro de 2025',
    city: 'Campinas',
    state: 'SP',
    venue: 'Fazenda Vila Rica',
    photographerId: 'p4',
    photographerName: 'Carolina Mendes',
    photographerSlug: 'carolina-mendes-boho',
    coverImage: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80'
    ],
    story: 'Música ao vivo sob árvores centenárias, altar com luzes pisca-pisca e noivos dançando descalços na grama.',
    style: 'Boho'
  }
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'b1',
    slug: 'como-escolher-fotografo-de-casamento',
    title: 'Como escolher o fotógrafo de casamento ideal em 2026',
    excerpt: 'Guia completo com 10 perguntas essenciais que todo casal precisa fazer antes de fechar o contrato com o fotógrafo.',
    content: `
Escolher o fotógrafo do seu casamento é uma das decisões mais importantes do planejamento. Afinal, a comida acaba, a decoração é desmontada, mas as **fotografias e o álbum** serão as lembranças eternas do seu grande dia.

### 1. Defina o Estilo que Combina com o Casal
Existem diversos estilos no mercado:
- **Fine Art**: fotos leves, iluminação natural, estética poética.
- **Fotojornalismo/Documental**: captura momentos espontâneos sem poses artificiais.
- **Clássico/Tradicional**: foco em fotos posicionadas, família e protocolos tradicionais.
- **Boho / Terroso**: tons quentes e clima romântico ao ar livre.

### 2. Peça para Ver um Casamento Completo
Não se baseie apenas no Instagram ou nas melhores fotos do portfólio. Peça para ver uma galeria inteira de um único casamento do início (Making Of) ao fim (Festa).

### 3. Perguntas Chave Antes de Assinar
- Quantos fotógrafos estarão na equipe?
- Qual é o prazo de entrega das fotos e do vídeo?
- Como funciona em caso de imprevistos ou imprevistos de saúde do fotógrafo principal?
- O contrato inclui direitos de uso e galeria digital sem marca d'água?
    `,
    category: 'Dicas de Fotografia',
    author: 'Equipe Guia Fotógrafo Casamento',
    date: '15 de Março de 2026',
    readTime: '6 min de leitura',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    seoKeywords: ['como escolher fotografo casamento', 'dicas contrato fotografo', 'estilos fotografia casamento']
  },
  {
    id: 'b2',
    slug: 'quanto-custa-fotografo-de-casamento',
    title: 'Quanto custa um fotógrafo de casamento em 2026? Média de preços',
    excerpt: 'Entenda os valores médios cobrados no Brasil, o que influencia o orçamento e como economizar sem perder qualidade.',
    content: `
O investimento em fotografia de casamento varia de acordo com a região, a experiência do profissional, a quantidade de horas e os entregáveis contratados.

### Faixas de Preço no Brasil em 2026:
- **Iniciante / Simples (Até R$ 2.000)**: Cobertura de 4h a 6h com 1 fotógrafo, ideal para casamentos civis ou mini weddings bem simples.
- **Profissional Consolidado (R$ 2.500 a R$ 5.000)**: Cobertura completa, pré-wedding, galeria em alta resolução e por vezes vídeo simples.
- **Estúdios Renomados e Fine Art (R$ 5.000 a R$ 10.000)**: Equipe com 2+ fotógrafos, making of dos noivos, álbum impresso em couro/linho e suporte dedicado.
- **Luxury / Destination Wedding (Acima de R$ 10.000)**: Cobertura cinematográfica, drone 4K, same day edit, múltiplos dias de evento e álbuns para pais.
    `,
    category: 'Orçamento',
    author: 'Eduardo Perez',
    date: '02 de Fevereiro de 2026',
    readTime: '8 min de leitura',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    seoKeywords: ['quanto custa fotografo casamento', 'preco fotografia casamento', 'orcamento casamento']
  },
  {
    id: 'b3',
    slug: 'pre-wedding-vale-a-pena',
    title: 'Ensaio Pré Wedding vale a pena? Dicas e Melhores Locais',
    excerpt: 'Descubra por que o ensaio de casal antes do casamento ajuda a perder a timidez diante das câmeras e cria memórias incríveis.',
    content: `
Muitos noivos se perguntam se vale a pena contratar o ensaio Pré-Wedding. A resposta é um retumbante SIM! Além de registrar a fase do noivado, o ensaio serve como um "treino" indispensável entre o casal e o fotógrafo.
    `,
    category: 'Ensaios',
    author: 'Carolina Mendes',
    date: '10 de Janeiro de 2026',
    readTime: '5 min de leitura',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    seoKeywords: ['pre wedding vale a pena', 'locais ensaio casal', 'dicas pre wedding']
  }
];

export const CITY_SEO_PAGES: CitySEOData[] = [
  {
    city: 'Piracicaba',
    state: 'SP',
    slug: 'fotografo-casamento-piracicaba',
    heroText: 'Encontre os melhores fotógrafos de casamento em Piracicaba - SP',
    seoDescription: 'Compare os principais estúdios de fotografia de casamento em Piracicaba. Preços, avaliações reais de noivos, portfólio completo e solicitação de orçamento rápido via WhatsApp.',
    introText: 'Piracicaba é famosa por suas fazendas históricas, espaços ao ar livre deslumbrantes no interior de SP e locais icônicos perto do Rio Piracicaba. Aqui você encontra fotógrafos especializados em casamentos no campo, mini weddings e cerimônias tradicionais.',
    faq: [
      { question: 'Qual é o preço médio de fotógrafo de casamento em Piracicaba?', answer: 'A média varia de R$ 2.500 a R$ 6.500 para coberturas completas com ensaio Pré-Wedding.' },
      { question: 'Quais os melhores locais para ensaio Pré Wedding em Piracicaba?', answer: 'O Engenho Central, Rua do Porto, Parque da Rua do Porto e fazendas no entorno da cidade são os favoritos.' }
    ]
  },
  {
    city: 'São Paulo',
    state: 'SP',
    slug: 'fotografo-casamento-sao-paulo',
    heroText: 'Fotógrafos de Casamento em São Paulo (SP) - Escolha com Segurança',
    seoDescription: 'Diretório completo com os mais renomados fotógrafos de casamento de SP. Filtre por bairro (Pinheiros, Moema, Jardins, Tatuapé), estilo e faixa de preço.',
    introText: 'São Paulo abriga os estúdios de fotografia mais premiados do país. Desde minicasamentos urbanos em rooftops até mega produções nos salões e igrejas históricas da capital.',
    faq: [
      { question: 'Como contratar fotógrafo por bairro em São Paulo?', answer: 'No portal Guia Fotógrafo Casamento você pode filtrar profissionais por Pinheiros, Moema, Jardins, Tatuapé, Zona Sul, Norte e Oeste.' }
    ]
  },
  {
    city: 'Curitiba',
    state: 'PR',
    slug: 'fotografo-casamento-curitiba',
    heroText: 'Fotógrafos de Casamento em Curitiba (PR) e Região Metropolitana',
    seoDescription: 'Os melhores profissionais de fotografia e filme de casamento em Curitiba. Castelo do Batel, parques e locais para mini wedding com orçamentos diretos.',
    introText: 'Curitiba combina cenários verdes exuberantes como os parques da cidade com espaços clássicos de eventos. Conheça fotógrafos curitibanos especializados em luz natural e estética fotojornalística.',
    faq: [
      { question: 'Onde fazer ensaio em Curitiba?', answer: 'Parque Tanguá, Jardim Botânico, Bosque Alemão e vinícolas em São José dos Pinhais.' }
    ]
  }
];

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'chk1', task: 'Definir estilo de fotografia desejado (Fine Art, Fotojornalismo, Boho, Clássico)', timeframe: '12 a 10 meses antes', completed: true, category: 'Análise' },
  { id: 'chk2', task: 'Simular orçamento de fotografia e definir teto de gasto', timeframe: '12 a 10 meses antes', completed: true, category: 'Análise' },
  { id: 'chk3', task: 'Pesquisar fotógrafos no portal Guia Fotógrafo Casamento por cidade', timeframe: '10 a 8 meses antes', completed: false, category: 'Fotografia' },
  { id: 'chk4', task: 'Solicitar orçamento para 3 a 4 fotógrafos e comparar propostas', timeframe: '10 a 8 meses antes', completed: false, category: 'Fotografia' },
  { id: 'chk5', task: 'Agendar reunião presencial ou chamada de vídeo para sentir a afinidade', timeframe: '8 a 6 meses antes', completed: false, category: 'Fotografia' },
  { id: 'chk6', task: 'Assinar contrato de fotografia e filme garantindo a data na agenda', timeframe: '8 a 6 meses antes', completed: false, category: 'Contrato' },
  { id: 'chk7', task: 'Agendar ensaio Pré Wedding e escolher locais/vestuário', timeframe: '4 a 2 meses antes', completed: false, category: 'Ensaio' },
  { id: 'chk8', task: 'Enviar cronograma da cerimônia e lista de fotos de família essenciais para o fotógrafo', timeframe: '1 mês antes', completed: false, category: 'Fotografia' }
];
