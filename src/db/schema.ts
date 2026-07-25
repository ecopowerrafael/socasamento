import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  int,
  json,
  mysqlTable,
  real,
  text,
  varchar,
  datetime,
  decimal,
} from 'drizzle-orm/mysql-core';

// Users table (Support local Auth + Firebase UID)
export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  uid: varchar('uid', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('BRIDE'), // 'ADMIN' | 'PROFESSIONAL' | 'BRIDE' | 'super_admin' | 'admin' | 'photographer' | 'client'
  avatar: text('avatar'),
  cpfCnpj: varchar('cpf_cnpj', { length: 50 }),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  lastLoginAt: datetime('last_login_at'),
  termsAcceptedAt: datetime('terms_accepted_at'),
  privacyConsentAt: datetime('privacy_consent_at'),
  marketingConsentAt: datetime('marketing_consent_at'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: datetime('deleted_at'),
});

// States table
export const states = mysqlTable('states', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  uf: varchar('uf', { length: 2 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  ibgeCode: varchar('ibge_code', { length: 20 }),
  region: varchar('region', { length: 50 }).default('Sudeste'),
  image: text('image'),
  introductoryText: text('introductory_text'),
  seoTitle: varchar('seo_title', { length: 255 }),
  seoDescription: text('seo_description'),
  showInNavigation: boolean('show_in_navigation').default(true),
  sortOrder: int('sort_order').default(0),
  status: varchar('status', { length: 20 }).default('active'),
  photographersCount: int('photographers_count').default(0),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: datetime('deleted_at'),
});

// Cities table
export const cities = mysqlTable('cities', {
  id: int('id').autoincrement().primaryKey(),
  stateId: int('state_id').references(() => states.id, { onDelete: 'cascade' }),
  stateUf: varchar('state_uf', { length: 2 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  ibgeCode: varchar('ibge_code', { length: 20 }),
  latitude: real('latitude'),
  longitude: real('longitude'),
  image: text('image'),
  introductoryText: text('introductory_text'),
  heroText: varchar('hero_text', { length: 255 }),
  seoTitle: varchar('seo_title', { length: 255 }),
  seoDescription: text('seo_description'),
  focusKeyword: varchar('focus_keyword', { length: 150 }),
  showInNavigation: boolean('show_in_navigation').default(true),
  featured: boolean('featured').default(false),
  sortOrder: int('sort_order').default(0),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: datetime('deleted_at'),
});

// Categories table
export const categories = mysqlTable('categories', {
  id: int('id').autoincrement().primaryKey(),
  parentId: int('parent_id'),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  shortDescription: text('short_description'),
  description: text('description'),
  icon: varchar('icon', { length: 255 }),
  image: text('image'),
  iconColor: varchar('icon_color', { length: 50 }),
  seoTitle: varchar('seo_title', { length: 255 }),
  seoDescription: text('seo_description'),
  focusKeyword: varchar('focus_keyword', { length: 150 }),
  showOnHome: boolean('show_on_home').default(false),
  showOnSearch: boolean('show_on_search').default(true),
  sortOrder: int('sort_order').default(0),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: datetime('deleted_at'),
});

// Photographer Categories Pivot table
export const photographerCategories = mysqlTable('photographer_categories', {
  id: int('id').autoincrement().primaryKey(),
  photographerId: int('photographer_id').notNull().references(() => photographers.id, { onDelete: 'cascade' }),
  categoryId: int('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Photographers table
export const photographers = mysqlTable('photographers', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  userUid: varchar('user_uid', { length: 255 }),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  studioName: varchar('studio_name', { length: 255 }).notNull(),
  avatar: text('avatar').notNull(),
  coverImage: text('cover_image').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 2 }).notNull(),
  neighborhood: varchar('neighborhood', { length: 100 }),
  rating: real('rating').default(5.0),
  reviewCount: int('review_count').default(0),
  priceStartingFrom: int('price_starting_from').default(0),
  priceCategory: varchar('price_category', { length: 100 }).default('R$ 2.000 a R$ 5.000'),
  styles: json('styles').$type<string[]>().default([]),
  deliverables: json('deliverables').$type<string[]>().default([]),
  categories: json('categories').$type<string[]>().default([]),
  badges: json('badges').$type<string[]>().default([]),
  yearsExperience: int('years_experience').default(0),
  weddingsCompleted: int('weddings_completed').default(0),
  awardsCount: int('awards_count').default(0),
  description: text('description'),
  bioFull: text('bio_full'),
  phone: varchar('phone', { length: 50 }),
  whatsapp: varchar('whatsapp', { length: 50 }),
  instagram: varchar('instagram', { length: 255 }),
  website: varchar('website', { length: 255 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  faqs: json('faqs').$type<{ question: string; answer: string }[]>().default([]),
  featuredInHome: boolean('featured_in_home').default(false),
  plan: varchar('plan', { length: 50 }).default('Gratuito'),
  status: varchar('status', { length: 20 }).default('approved'),
  viewsCount: int('views_count').default(0),
  whatsappClicks: int('whatsapp_clicks').default(0),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Photographer Media (Gallery photos & videos)
export const photographerMedia = mysqlTable('photographer_media', {
  id: int('id').autoincrement().primaryKey(),
  photographerId: int('photographer_id').notNull().references(() => photographers.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull().default('photo'),
  url: text('url').notNull(),
  caption: varchar('caption', { length: 255 }),
  category: varchar('category', { length: 100 }).default('Cerimônia'),
  featured: boolean('featured').default(false),
  thumbnail: text('thumbnail'),
  embedUrl: text('embed_url'),
  sortOrder: int('sort_order').default(0),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Photographer Packages
export const photographerPackages = mysqlTable('photographer_packages', {
  id: int('id').autoincrement().primaryKey(),
  photographerId: int('photographer_id').notNull().references(() => photographers.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  price: int('price').notNull(),
  popular: boolean('popular').default(false),
  description: text('description'),
  features: json('features').$type<string[]>().default([]),
  deliverables: json('deliverables').$type<string[]>().default([]),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Reviews
export const reviews = mysqlTable('reviews', {
  id: int('id').autoincrement().primaryKey(),
  photographerId: int('photographer_id').notNull().references(() => photographers.id, { onDelete: 'cascade' }),
  userUid: varchar('user_uid', { length: 255 }),
  coupleName: varchar('couple_name', { length: 255 }).notNull(),
  date: varchar('date', { length: 50 }).notNull(),
  weddingLocation: varchar('wedding_location', { length: 255 }),
  rating: int('rating').notNull(),
  comment: text('comment').notNull(),
  photos: json('photos').$type<string[]>().default([]),
  photographerReply: text('photographer_reply'),
  verifiedBooking: boolean('verified_booking').default(true),
  status: varchar('status', { length: 20 }).default('approved'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Leads (Orçamentos / Propostas)
export const leads = mysqlTable('leads', {
  id: int('id').autoincrement().primaryKey(),
  userUid: varchar('user_uid', { length: 255 }),
  photographerId: int('photographer_id').references(() => photographers.id, { onDelete: 'cascade' }),
  coupleName: varchar('couple_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  whatsapp: varchar('whatsapp', { length: 50 }),
  weddingDate: varchar('wedding_date', { length: 50 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 2 }),
  venueType: varchar('venue_type', { length: 100 }),
  estimatedGuests: int('estimated_guests'),
  budgetLimit: int('budget_limit'),
  servicesNeeded: json('services_needed').$type<string[]>().default([]),
  stylePreference: varchar('style_preference', { length: 100 }),
  photographerIds: json('photographer_ids').$type<string[]>().default([]),
  message: text('message'),
  status: varchar('status', { length: 50 }).default('Novo'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Recent Weddings
export const recentWeddings = mysqlTable('recent_weddings', {
  id: int('id').autoincrement().primaryKey(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  couple: varchar('couple', { length: 255 }).notNull(),
  date: varchar('date', { length: 50 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 2 }).notNull(),
  venue: varchar('venue', { length: 255 }),
  photographerId: int('photographer_id').references(() => photographers.id, { onDelete: 'set null' }),
  photographerName: varchar('photographer_name', { length: 255 }),
  photographerSlug: varchar('photographer_slug', { length: 150 }),
  coverImage: text('cover_image').notNull(),
  gallery: json('gallery').$type<string[]>().default([]),
  story: text('story'),
  style: varchar('style', { length: 100 }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Blog Articles
export const blogArticles = mysqlTable('blog_articles', {
  id: int('id').autoincrement().primaryKey(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  excerpt: text('excerpt'),
  content: text('content'),
  category: varchar('category', { length: 100 }),
  author: varchar('author', { length: 100 }),
  date: varchar('date', { length: 50 }),
  readTime: varchar('read_time', { length: 50 }),
  image: text('image'),
  seoKeywords: json('seo_keywords').$type<string[]>().default([]),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Subscription Plans
export const subscriptionPlans = mysqlTable('subscription_plans', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  internalName: varchar('internal_name', { length: 100 }),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  internalCode: varchar('internal_code', { length: 100 }),
  shortDescription: text('short_description'),
  description: text('description'),
  currency: varchar('currency', { length: 10 }).default('BRL'),
  isFree: boolean('is_free').default(false),
  monthlyPrice: decimal('monthly_price', { precision: 10, scale: 2 }).default('0.00'),
  annualPrice: decimal('annual_price', { precision: 10, scale: 2 }).default('0.00'),
  promotionalMonthlyPrice: decimal('promotional_monthly_price', { precision: 10, scale: 2 }),
  promotionalAnnualPrice: decimal('promotional_annual_price', { precision: 10, scale: 2 }),
  annualMonthlyEquivalent: decimal('annual_monthly_equivalent', { precision: 10, scale: 2 }),
  annualSavingsAmount: decimal('annual_savings_amount', { precision: 10, scale: 2 }),
  annualDiscountPercentage: decimal('annual_discount_percentage', { precision: 5, scale: 2 }),
  setupFee: decimal('setup_fee', { precision: 10, scale: 2 }).default('0.00'),
  trialEnabled: boolean('trial_enabled').default(false),
  trialDays: int('trial_days').default(0),
  promotionStartAt: datetime('promotion_start_at'),
  promotionEndAt: datetime('promotion_end_at'),
  mainColor: varchar('main_color', { length: 50 }).default('#C88E9B'),
  textColor: varchar('text_color', { length: 50 }).default('#5A4035'),
  buttonColor: varchar('button_color', { length: 50 }).default('#C88E9B'),
  icon: varchar('icon', { length: 100 }).default('Sparkles'),
  badgeText: varchar('badge_text', { length: 100 }),
  buttonText: varchar('button_text', { length: 100 }).default('Assinar Agora'),
  buttonUrl: text('button_url'),
  buttonTarget: varchar('button_target', { length: 20 }).default('_self'),
  textAbovePrice: text('text_above_price'),
  textBelowPrice: text('text_below_price'),
  isRecommended: boolean('is_recommended').default(false),
  isPremium: boolean('is_premium').default(false),
  isFeatured: boolean('is_featured').default(false),
  showOnHome: boolean('show_on_home').default(true),
  showOnPricingPage: boolean('show_on_pricing_page').default(true),
  showOnRegistration: boolean('show_on_registration').default(true),
  showOnProfessionalDashboard: boolean('show_on_professional_dashboard').default(true),
  allowMonthlyBilling: boolean('allow_monthly_billing').default(true),
  allowAnnualBilling: boolean('allow_annual_billing').default(true),
  allowCancel: boolean('allow_cancel').default(true),
  allowUpgrade: boolean('allow_upgrade').default(true),
  allowDowngrade: boolean('allow_downgrade').default(true),
  sortOrder: int('sort_order').default(0),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: datetime('deleted_at'),
});

// Subscription Plan Items
export const subscriptionPlanItems = mysqlTable('subscription_plan_items', {
  id: int('id').autoincrement().primaryKey(),
  planId: int('plan_id').references(() => subscriptionPlans.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  isIncluded: boolean('is_included').default(true),
  isFeatured: boolean('is_featured').default(false),
  limitValue: varchar('limit_value', { length: 100 }),
  isUnlimited: boolean('is_unlimited').default(false),
  displayText: varchar('display_text', { length: 255 }),
  sortOrder: int('sort_order').default(0),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: datetime('deleted_at'),
});

// Subscription Plan Features (Structured Permissions)
export const subscriptionPlanFeatures = mysqlTable('subscription_plan_features', {
  id: int('id').autoincrement().primaryKey(),
  planId: int('plan_id').references(() => subscriptionPlans.id, { onDelete: 'cascade' }),
  featureKey: varchar('feature_key', { length: 100 }).notNull(),
  featureName: varchar('feature_name', { length: 255 }),
  featureType: varchar('feature_type', { length: 50 }).default('boolean'), // 'boolean' | 'numeric' | 'text'
  booleanValue: boolean('boolean_value').default(false),
  numericValue: int('numeric_value'),
  textValue: text('text_value'),
  isUnlimited: boolean('is_unlimited').default(false),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Subscriptions
export const subscriptions = mysqlTable('subscriptions', {
  id: int('id').autoincrement().primaryKey(),
  photographerId: int('photographer_id').references(() => photographers.id, { onDelete: 'cascade' }),
  planId: int('plan_id').references(() => subscriptionPlans.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 20 }).default('active'),
  startDate: datetime('start_date').default(sql`CURRENT_TIMESTAMP`),
  nextBillingDate: datetime('next_billing_date'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Favorites
export const favorites = mysqlTable('favorites', {
  id: int('id').autoincrement().primaryKey(),
  userUid: varchar('user_uid', { length: 255 }).notNull(),
  photographerId: int('photographer_id').references(() => photographers.id, { onDelete: 'cascade' }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// User Checklists
export const userChecklists = mysqlTable('user_checklists', {
  id: int('id').autoincrement().primaryKey(),
  userUid: varchar('user_uid', { length: 255 }).notNull(),
  task: varchar('task', { length: 255 }).notNull(),
  timeframe: varchar('timeframe', { length: 100 }),
  completed: boolean('completed').default(false),
  category: varchar('category', { length: 100 }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Budget Simulations
export const budgetSimulations = mysqlTable('budget_simulations', {
  id: int('id').autoincrement().primaryKey(),
  userUid: varchar('user_uid', { length: 255 }),
  guestCount: int('guest_count'),
  totalWeddingBudget: int('total_wedding_budget'),
  recommendedMin: int('recommended_min'),
  recommendedMax: int('recommended_max'),
  selectedServices: json('selected_services').$type<string[]>().default([]),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Click Logs
export const clickLogs = mysqlTable('click_logs', {
  id: int('id').autoincrement().primaryKey(),
  photographerId: int('photographer_id').references(() => photographers.id, { onDelete: 'cascade' }),
  clickType: varchar('click_type', { length: 50 }).notNull(),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Site Settings
export const settings = mysqlTable('settings', {
  id: int('id').autoincrement().primaryKey(),
  settingKey: varchar('setting_key', { length: 100 }).notNull().unique(),
  settingValue: text('setting_value'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  photographers: many(photographers),
}));

export const photographersRelations = relations(photographers, ({ one, many }) => ({
  user: one(users, {
    fields: [photographers.userId],
    references: [users.id],
  }),
  media: many(photographerMedia),
  packages: many(photographerPackages),
  reviews: many(reviews),
  leads: many(leads),
  subscriptions: many(subscriptions),
  clickLogs: many(clickLogs),
}));

export const photographerMediaRelations = relations(photographerMedia, ({ one }) => ({
  photographer: one(photographers, {
    fields: [photographerMedia.photographerId],
    references: [photographers.id],
  }),
}));

export const photographerPackagesRelations = relations(photographerPackages, ({ one }) => ({
  photographer: one(photographers, {
    fields: [photographerPackages.photographerId],
    references: [photographers.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  photographer: one(photographers, {
    fields: [reviews.photographerId],
    references: [photographers.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  photographer: one(photographers, {
    fields: [leads.photographerId],
    references: [photographers.id],
  }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  items: many(subscriptionPlanItems),
  features: many(subscriptionPlanFeatures),
  subscriptions: many(subscriptions),
}));

export const subscriptionPlanItemsRelations = relations(subscriptionPlanItems, ({ one }) => ({
  plan: one(subscriptionPlans, {
    fields: [subscriptionPlanItems.planId],
    references: [subscriptionPlans.id],
  }),
}));

export const subscriptionPlanFeaturesRelations = relations(subscriptionPlanFeatures, ({ one }) => ({
  plan: one(subscriptionPlans, {
    fields: [subscriptionPlanFeatures.planId],
    references: [subscriptionPlans.id],
  }),
}));

// ============================================================================
// BRIDE / COUPLE PORTAL (FERRAMENTA NOIVAS) TABLES
// ============================================================================

// Couple Profiles Table
export const coupleProfiles = mysqlTable('couple_profiles', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  partnerName: varchar('partner_name', { length: 255 }),
  weddingDate: varchar('wedding_date', { length: 50 }),
  weddingType: varchar('wedding_type', { length: 100 }),
  estimatedGuests: int('estimated_guests').default(100),
  estimatedBudget: decimal('estimated_budget', { precision: 12, scale: 2 }).default('80000.00'),
  weddingStyle: varchar('wedding_style', { length: 100 }),
  ceremonyLocation: varchar('ceremony_location', { length: 255 }),
  receptionLocation: varchar('reception_location', { length: 255 }),
  stateId: int('state_id'),
  cityId: int('city_id'),
  couplePhoto: text('couple_photo'),
  planningProgress: int('planning_progress').default(0),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Wedding Tasks (Checklist)
export const weddingTasks = mysqlTable('wedding_tasks', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  recommendedMonth: varchar('recommended_month', { length: 100 }),
  dueDate: varchar('due_date', { length: 50 }),
  priority: varchar('priority', { length: 20 }).default('medium'),
  isCompleted: boolean('is_completed').default(false),
  completedAt: datetime('completed_at'),
  sortOrder: int('sort_order').default(0),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: datetime('deleted_at'),
});

// Wedding Events (Agenda)
export const weddingEvents = mysqlTable('wedding_events', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  eventType: varchar('event_type', { length: 100 }),
  location: varchar('location', { length: 255 }),
  startAt: varchar('start_at', { length: 100 }),
  endAt: varchar('end_at', { length: 100 }),
  allDay: boolean('all_day').default(false),
  reminderEnabled: boolean('reminder_enabled').default(true),
  reminderMinutes: int('reminder_minutes').default(60),
  status: varchar('status', { length: 50 }).default('scheduled'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: datetime('deleted_at'),
});

// Wedding Budgets
export const weddingBudgets = mysqlTable('wedding_budgets', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  totalBudget: decimal('total_budget', { precision: 12, scale: 2 }).default('80000.00'),
  currency: varchar('currency', { length: 10 }).default('BRL'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Wedding Budget Categories (Calculadora de orçamento percentual)
export const weddingBudgetCategories = mysqlTable('wedding_budget_categories', {
  id: int('id').autoincrement().primaryKey(),
  budgetId: int('budget_id').notNull().references(() => weddingBudgets.id, { onDelete: 'cascade' }),
  categoryName: varchar('category_name', { length: 100 }).notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).notNull(),
  plannedAmount: decimal('planned_amount', { precision: 12, scale: 2 }).default('0.00'),
  actualAmount: decimal('actual_amount', { precision: 12, scale: 2 }).default('0.00'),
  sortOrder: int('sort_order').default(0),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Wedding Expenses (Controle de Gastos)
export const weddingExpenses = mysqlTable('wedding_expenses', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  supplierName: varchar('supplier_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  description: text('description'),
  contractedAmount: decimal('contracted_amount', { precision: 12, scale: 2 }).default('0.00'),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).default('0.00'),
  remainingAmount: decimal('remaining_amount', { precision: 12, scale: 2 }).default('0.00'),
  dueDate: varchar('due_date', { length: 50 }),
  paymentStatus: varchar('payment_status', { length: 50 }).default('Pendente'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  notes: text('notes'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: datetime('deleted_at'),
});

// Installment Simulations (Simulador de parcelas)
export const installmentSimulations = mysqlTable('installment_simulations', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  description: varchar('description', { length: 255 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  installments: int('installments').notNull(),
  installmentAmount: decimal('installment_amount', { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal('interest_rate', { precision: 5, scale: 2 }).default('0.00'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Wedding Guests (Lista de Convidados)
export const weddingGuests = mysqlTable('wedding_guests', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  familyGroup: varchar('family_group', { length: 100 }),
  companions: int('companions').default(0),
  tableName: varchar('table_name', { length: 100 }),
  sector: varchar('sector', { length: 100 }),
  invitationStatus: varchar('invitation_status', { length: 50 }).default('Pendente'),
  confirmationStatus: varchar('confirmation_status', { length: 50 }).default('pending'), // 'pending' | 'confirmed' | 'declined'
  dietaryRestrictions: text('dietary_restrictions'),
  notes: text('notes'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: datetime('deleted_at'),
});

// Wedding Gifts (Lista de Presentes)
export const weddingGifts = mysqlTable('wedding_gifts', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  estimatedValue: decimal('estimated_value', { precision: 12, scale: 2 }).default('0.00'),
  productUrl: text('product_url'),
  image: text('image'),
  isPurchased: boolean('is_purchased').default(false),
  purchasedBy: varchar('purchased_by', { length: 255 }),
  message: text('message'),
  purchasedAt: datetime('purchased_at'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  deletedAt: datetime('deleted_at'),
});

// Inspiration Favorites
export const inspirationFavorites = mysqlTable('inspiration_favorites', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  inspirationId: varchar('inspiration_id', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }),
  category: varchar('category', { length: 100 }),
  imageUrl: text('image_url'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Photographer Favorites
export const photographerFavorites = mysqlTable('photographer_favorites', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  photographerId: int('photographer_id').notNull().references(() => photographers.id, { onDelete: 'cascade' }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Photo Location Favorites
export const photoLocationFavorites = mysqlTable('photo_location_favorites', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  locationId: varchar('location_id', { length: 100 }).notNull(),
  locationName: varchar('location_name', { length: 255 }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Photography Quote Simulations (Simulador de orçamento de fotografia)
export const photographyQuoteSimulations = mysqlTable('photography_quote_simulations', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cityId: int('city_id'),
  guestCount: int('guest_count'),
  weddingType: varchar('wedding_type', { length: 100 }),
  coverageHours: int('coverage_hours'),
  includeDrone: boolean('include_drone').default(false),
  includeAlbum: boolean('include_album').default(false),
  includeSecondPhotographer: boolean('include_second_photographer').default(false),
  estimatedMinPrice: decimal('estimated_min_price', { precision: 12, scale: 2 }),
  estimatedMaxPrice: decimal('estimated_max_price', { precision: 12, scale: 2 }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Photography Quote Requests
export const photographyQuoteRequests = mysqlTable('photography_quote_requests', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  simulationId: int('simulation_id'),
  photographerId: int('photographer_id').notNull().references(() => photographers.id, { onDelete: 'cascade' }),
  message: text('message'),
  status: varchar('status', { length: 50 }).default('Novo'),
  sentAt: datetime('sent_at').default(sql`CURRENT_TIMESTAMP`),
  viewedAt: datetime('viewed_at'),
  respondedAt: datetime('responded_at'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Wedding Timelines (Cronograma)
export const weddingTimelines = mysqlTable('wedding_timelines', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).default('Cronograma do Dia do Casamento'),
  weddingDate: varchar('wedding_date', { length: 50 }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Wedding Timeline Items
export const weddingTimelineItems = mysqlTable('wedding_timeline_items', {
  id: int('id').autoincrement().primaryKey(),
  timelineId: int('timeline_id').notNull().references(() => weddingTimelines.id, { onDelete: 'cascade' }),
  time: varchar('time', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  responsible: varchar('responsible', { length: 255 }),
  location: varchar('location', { length: 255 }),
  sortOrder: int('sort_order').default(0),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Wedding Websites (Site do Casal)
export const weddingWebsites = mysqlTable('wedding_websites', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  coupleNames: varchar('couple_names', { length: 255 }).notNull(),
  headline: text('headline'),
  story: text('story'),
  weddingDate: varchar('wedding_date', { length: 50 }),
  ceremonyLocation: text('ceremony_location'),
  receptionLocation: text('reception_location'),
  coverImage: text('cover_image'),
  theme: varchar('theme', { length: 50 }).default('Romantic Rose'),
  primaryColor: varchar('primary_color', { length: 50 }).default('#C88E9B'),
  isPublished: boolean('is_published').default(true),
  rsvpEnabled: boolean('rsvp_enabled').default(true),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Wedding RSVPs
export const weddingRsvps = mysqlTable('wedding_rsvps', {
  id: int('id').autoincrement().primaryKey(),
  weddingWebsiteId: int('wedding_website_id').notNull().references(() => weddingWebsites.id, { onDelete: 'cascade' }),
  guestName: varchar('guest_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  companions: int('companions').default(0),
  confirmationStatus: varchar('confirmation_status', { length: 50 }).default('confirmed'),
  message: text('message'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Wedding Style Quiz Results
export const weddingStyleQuizResults = mysqlTable('wedding_style_quiz_results', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  answersJson: json('answers_json').$type<Record<string, any>>().default({}),
  resultStyle: varchar('result_style', { length: 100 }),
  scoreJson: json('score_json').$type<Record<string, number>>().default({}),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Achievements (Conquistas / Gamificação)
export const achievements = mysqlTable('achievements', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  category: varchar('category', { length: 100 }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// User Achievements
export const userAchievements = mysqlTable('user_achievements', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: int('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  unlockedAt: datetime('unlocked_at').default(sql`CURRENT_TIMESTAMP`),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Password Resets Table
export const passwordResets = mysqlTable('password_resets', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: datetime('expires_at').notNull(),
  usedAt: datetime('used_at'),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});
