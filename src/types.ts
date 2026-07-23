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
  badges: BadgeType[];
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
