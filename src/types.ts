export type UserRole = 'super_admin' | 'admin' | 'photographer' | 'client' | 'bride';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photographerId?: string;
  studioName?: string;
  city?: string;
  state?: string;
  phone?: string;
  lastLoginAt?: string;
}

export type StyleType = 
  | 'Documental' 
  | 'Fine Art' 
  | 'Clássico' 
  | 'Editorial' 
  | 'Boho' 
  | 'Luxury' 
  | 'Minimalista' 
  | 'Fotojornalismo' 
  | 'Lifestyle';

export type DeliveryType = 
  | 'Foto' 
  | 'Vídeo' 
  | 'Drone' 
  | 'Same Day Edit' 
  | 'Álbum' 
  | 'Making Of'
  | 'Pré Wedding'
  | 'Pós Wedding';

export type CategoryType = 
  | 'Fotógrafos'
  | 'Foto e Filme'
  | 'Drone'
  | 'Pré Wedding'
  | 'Pós Wedding'
  | 'Mini Wedding'
  | 'Destination Wedding'
  | 'Casamento Civil'
  | 'Casamento Religioso';

export type BadgeType = 'Verificado' | 'Top Avaliado' | 'Premium';

export interface PricingPackage {
  id: string;
  name: string;
  price: number;
  popular?: boolean;
  description: string;
  features: string[];
  deliverables: string[];
}

export interface Review {
  id: string;
  coupleName: string;
  date: string;
  weddingLocation: string;
  rating: number;
  comment: string;
  photos?: string[];
  photographerReply?: string;
  verifiedBooking: boolean;
}

export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  category: 'Pré Wedding' | 'Making Of' | 'Cerimônia' | 'Festa' | 'Drone' | 'Álbuns';
  featured?: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  embedUrl: string;
  type: 'YouTube' | 'Vimeo' | 'Reels';
}

export interface Photographer {
  id: string;
  slug: string;
  name: string;
  studioName: string;
  avatar: string;
  coverImage: string;
  city: string;
  state: string;
  neighborhood?: string;
  rating: number;
  reviewCount: number;
  priceStartingFrom: number;
  priceCategory: 'Até R$ 2.000' | 'R$ 2.000 a R$ 5.000' | 'R$ 5.000 a R$ 10.000' | 'Acima de R$ 10.000';
  styles: StyleType[];
  deliverables: DeliveryType[];
  categories: CategoryType[];
  serviceCities?: string[];
  badges: BadgeType[];
  planPermissions?: Record<string, boolean | number | string | null>;
  yearsExperience: number;
  weddingsCompleted: number;
  awardsCount: number;
  description: string;
  bioFull: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  website: string;
  email: string;
  address?: string;
  gallery: PhotoItem[];
  videos: VideoItem[];
  packages: PricingPackage[];
  reviews: Review[];
  faqs: { question: string; answer: string }[];
  featuredInHome?: boolean;
  plan: 'Gratuito' | 'Destaque' | 'Premium';
}

export interface RecentWedding {
  id: string;
  slug: string;
  title: string;
  couple: string;
  date: string;
  city: string;
  state: string;
  venue: string;
  photographerId: string;
  photographerName: string;
  photographerSlug: string;
  coverImage: string;
  gallery: string[];
  story: string;
  style: StyleType;
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  seoKeywords: string[];
}

export interface CategoryItem {
  id: number;
  parentId?: number | null;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  iconColor?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  focusKeyword?: string | null;
  showOnHome: boolean;
  showOnSearch: boolean;
  sortOrder: number;
  status: 'active' | 'inactive';
  photographersCount?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface StateItem {
  id: number;
  name: string;
  uf: string;
  slug: string;
  ibgeCode?: string | null;
  region?: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul' | string;
  image?: string | null;
  introductoryText?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  showInNavigation: boolean;
  sortOrder: number;
  status: 'active' | 'inactive';
  citiesCount?: number;
  photographersCount?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CityItem {
  id: number;
  stateId?: number | null;
  stateUf: string;
  stateName?: string;
  name: string;
  slug: string;
  ibgeCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image?: string | null;
  introductoryText?: string | null;
  heroText?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  focusKeyword?: string | null;
  showInNavigation: boolean;
  featured: boolean;
  sortOrder: number;
  status: 'active' | 'inactive';
  photographersCount?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface StateData {
  uf: string;
  name: string;
  citiesCount: number;
  photographersCount: number;
  topCities: string[];
}

export interface CitySEOData {
  city: string;
  state: string;
  slug: string;
  heroText: string;
  seoDescription: string;
  introText: string;
  faq: { question: string; answer: string }[];
}

export interface QuoteLead {
  id: string;
  createdAt: string;
  coupleName: string;
  email: string;
  phone: string;
  whatsapp: string;
  weddingDate: string;
  city: string;
  state: string;
  venueType: string;
  estimatedGuests: number;
  budgetLimit: number;
  servicesNeeded: DeliveryType[];
  stylePreference: StyleType;
  photographerIds: string[]; // multi-quote support
  message: string;
  status: 'Novo' | 'Em Atendimento' | 'Proposta Enviada' | 'Fechado' | 'Perdido';
}

export interface SearchFilters {
  city: string;
  state: string;
  neighborhood: string;
  keyword: string;
  styles: StyleType[];
  priceRange: string;
  deliverables: DeliveryType[];
  category: string;
  verifiedOnly: boolean;
  minRating: number;
  sortBy: 'rating' | 'reviews' | 'price_asc' | 'price_desc' | 'experience';
}

export interface ChecklistItem {
  id: string;
  task: string;
  timeframe: string;
  completed: boolean;
  category: 'Fotografia' | 'Local' | 'Análise' | 'Contrato' | 'Ensaio';
}

export interface BudgetCalculatorInput {
  guestCount: number;
  totalWeddingBudget: number;
  wantsVideo: boolean;
  wantsDrone: boolean;
  wantsAlbum: boolean;
  wantsPreWedding: boolean;
  stylePreference: StyleType;
}

export interface BrideGuest {
  id: string;
  name: string;
  phone: string;
  family: string;
  status: 'confirmado' | 'pendente' | 'recusado';
  companionCount: number;
  tableNumber: string;
}

export interface BrideGift {
  id: string;
  title: string;
  value: number;
  purchased: boolean;
  givenBy?: string;
  category?: string;
  imageUrl?: string;
}

export interface BrideExpense {
  id: string;
  category: string;
  supplier: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
}

export interface BrideCalendarEvent {
  id: string;
  title: string;
  type: 'Degustação' | 'Prova do vestido' | 'Reunião com fotógrafo' | 'Chá de panela' | 'Casamento civil' | 'Outros';
  date: string;
  time: string;
  location?: string;
  notify: boolean;
  notes?: string;
}

export interface BrideInspiration {
  id: string;
  title: string;
  category: 'decoração' | 'vestido' | 'fotografia' | 'maquiagem' | 'bolo';
  imageUrl: string;
  likesCount: number;
  favorited?: boolean;
}

export interface BridePhotoLocation {
  id: string;
  name: string;
  category: 'Lago' | 'Fazenda' | 'Cachoeira' | 'Centro histórico' | 'Praia' | 'Campo';
  city: string;
  state: string;
  coverImage: string;
  idealTime: string;
  needAuthorization: boolean;
  feeInfo?: string;
  description: string;
  address?: string;
}

export interface BrideWeddingSite {
  coupleNames: string;
  weddingDate: string;
  story: string;
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  coverPhoto: string;
  galleryPhotos: string[];
}

export interface BrideGamificationBadge {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
  description: string;
  progressPercent?: number;
}
