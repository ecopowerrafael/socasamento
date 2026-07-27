import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db, testConnection } from './src/db/index.ts';
import {
  users,
  states,
  cities,
  photographers,
  photographerMedia,
  photographerPackages,
  reviews,
  leads,
  recentWeddings,
  blogArticles,
  subscriptionPlans,
  subscriptionPlanItems,
  subscriptionPlanFeatures,
  photographerSubscriptions,
  subscriptionPayments,
  subscriptionHistory,
  photographerPlanPeriods,
  subscriptions,
  categories,
  photographerCategories,
  favorites,
  userChecklists,
  clickLogs,
} from './src/db/schema.ts';
import { SubscriptionService } from './src/services/subscriptionService.ts';
import { eq, and, sql, desc, asc, inArray, or, isNull, like } from 'drizzle-orm';
import { seedDatabase } from './src/db/seed.ts';
import {
  requireAuth,
  optionalAuth,
  requireAdmin,
  requirePhotographerOrAdmin,
  signToken,
  AuthRequest,
} from './src/middleware/auth.ts';
import bcrypt from 'bcryptjs';
import { auditMysqlSchema, ensureCompleteMysqlSchema } from './src/db/schemaBootstrap.ts';
import authRoutes from './src/routes/authRoutes.ts';
import brideRoutes from './src/routes/brideRoutes.ts';
import publicRoutes from './src/routes/publicRoutes.ts';
import mercadoPagoRoutes from './src/routes/mercadoPagoRoutes.ts';
import notificationRoutes from './src/routes/notificationRoutes.ts';
import contentRoutes from './src/routes/contentRoutes.ts';
import { NotificationEventService, eventReminderService, notificationDeliveryWorker } from './src/services/notificationSystem.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());
  app.use(cookieParser());

  // Hostinger requires listen() within 3 seconds. Schema migrations and
  // initial seeding can take longer, so open the HTTP port before bootstrap.
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}; initializing MySQL...`);
  });

  // MySQL is mandatory. No functional data is served from memory or browser storage.
  console.log('Verificando conexão e schema do MySQL...');
  const connStatus = await testConnection();
  if (!connStatus.success) {
    throw new Error('O MySQL é obrigatório. Corrija DB_HOST, DB_DATABASE, DB_USERNAME e DB_PASSWORD antes de iniciar.');
  }
  const schemaAudit = await ensureCompleteMysqlSchema();
  console.log(`Schema MySQL pronto: ${schemaAudit.existingTables}/${schemaAudit.expectedTables} tabelas.`);
  await seedDatabase();

  // --- API ROUTES ---
  app.use('/api/auth', authRoutes);
  app.use('/api/bride', brideRoutes);
  app.use('/api', mercadoPagoRoutes);
  app.use('/api', publicRoutes);
  app.use('/api', notificationRoutes);
  app.use('/api', contentRoutes);

  // O banco é a fonte oficial da fila; este worker apenas busca e processa
  // entregas persistidas, permitindo retomada segura após reinicializações.
  const notificationWorkerTimer = setInterval(() => {
    notificationDeliveryWorker.runOnce().catch((error) => {
      console.error('Falha no worker de notificações:', error);
    });
  }, 15_000);
  notificationWorkerTimer.unref();
  notificationDeliveryWorker.runOnce().catch(() => {});
  const reminderWorkerTimer = setInterval(() => {
    eventReminderService.runOnce().catch((error) => {
      console.error('Falha no worker de lembretes:', error);
    });
  }, 60_000);
  reminderWorkerTimer.unref();
  eventReminderService.runOnce().catch(() => {});

  // Database Connection Test Route
  app.get('/api/db/test', async (req, res) => {
    const connection = await testConnection();
    const schema = connection.success ? await auditMysqlSchema() : null;
    res.status(connection.success && schema?.ready ? 200 : 503).json({
      success: connection.success && schema?.ready,
      connection,
      schema,
    });
  });

  // Health check
  app.get('/api/health', async (req, res) => {
    const currentConn = await testConnection();
    res.json({
      status: 'ok',
      database: 'MySQL 8 / MariaDB',
      connectionStatus: currentConn.success ? 'connected' : 'disconnected',
      time: new Date().toISOString(),
    });
  });

  // --- PHOTOGRAPHERS API ---

  // Get list of photographers with filters
  app.get('/api/photographers', async (req, res) => {
    try {
      const {
        city,
        state,
        neighborhood,
        keyword,
        category,
        priceCategory,
        verifiedOnly,
        minRating,
        sortBy,
      } = req.query;

      const allPhotographers: any[] = await db.select().from(photographers);

      // Filter in memory for maximum search flexibility
      let result = allPhotographers.filter((p) => {
        if (p.status && p.status !== 'approved') return false;

        if (city && p.city.toLowerCase() !== String(city).toLowerCase()) return false;
        if (state && p.state.toLowerCase() !== String(state).toLowerCase()) return false;
        if (
          neighborhood &&
          p.neighborhood &&
          p.neighborhood.toLowerCase() !== String(neighborhood).toLowerCase()
        )
          return false;

        if (category && Array.isArray(p.categories) && !p.categories.includes(String(category)))
          return false;
        if (priceCategory && p.priceCategory !== String(priceCategory)) return false;

        if (verifiedOnly === 'true' && (!p.badges || !p.badges.includes('Verificado')))
          return false;
        if (minRating && (p.rating || 0) < Number(minRating)) return false;

        if (keyword) {
          const kw = String(keyword).toLowerCase();
          const matchName = p.name.toLowerCase().includes(kw);
          const matchStudio = p.studioName.toLowerCase().includes(kw);
          const matchCity = p.city.toLowerCase().includes(kw);
          const matchDesc = p.description?.toLowerCase().includes(kw) || false;
          if (!matchName && !matchStudio && !matchCity && !matchDesc) return false;
        }

        return true;
      });

      // Sorting
      if (sortBy === 'rating') {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortBy === 'reviews') {
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      } else if (sortBy === 'price_asc') {
        result.sort((a, b) => (a.priceStartingFrom || 0) - (b.priceStartingFrom || 0));
      } else if (sortBy === 'price_desc') {
        result.sort((a, b) => (b.priceStartingFrom || 0) - (a.priceStartingFrom || 0));
      } else if (sortBy === 'experience') {
        result.sort((a, b) => (b.yearsExperience || 0) - (a.yearsExperience || 0));
      } else {
        // Default sort: Premium first, then rating
        result.sort((a, b) => {
          if (a.plan === 'Premium' && b.plan !== 'Premium') return -1;
          if (b.plan === 'Premium' && a.plan !== 'Premium') return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
      }

      const mediaList = await db.select().from(photographerMedia);
      const pkgList = await db.select().from(photographerPackages);
      const revList = await db.select().from(reviews);

      const formatted = result.map((p) => {
            const pMedia = mediaList.filter((m) => m.photographerId === p.id);
            const pPkgs = pkgList.filter((k) => k.photographerId === p.id);
            const pRevs = revList.filter((r) => r.photographerId === p.id);

            return {
              ...p,
              gallery: pMedia
                .filter((m) => m.type === 'photo')
                .map((m) => ({
                  id: String(m.id),
                  url: m.url,
                  caption: m.caption || '',
                  category: m.category || 'Cerimônia',
                  featured: m.featured || false,
                })),
              videos: pMedia
                .filter((m) => m.type === 'video')
                .map((m) => ({
                  id: String(m.id),
                  title: m.caption || 'Vídeo de Casamento',
                  thumbnail: m.thumbnail || p.coverImage,
                  embedUrl: m.embedUrl || m.url,
                  type: 'YouTube',
                })),
              packages: pPkgs.map((k) => ({
                id: String(k.id),
                name: k.name,
                price: k.price,
                popular: k.popular || false,
                description: k.description || '',
                features: (k.features as string[]) || [],
                deliverables: (k.deliverables as string[]) || [],
              })),
              reviews: pRevs.map((r) => ({
                id: String(r.id),
                coupleName: r.coupleName,
                date: r.date,
                weddingLocation: r.weddingLocation || '',
                rating: r.rating,
                comment: r.comment,
                verifiedBooking: r.verifiedBooking || true,
                photographerReply: r.photographerReply || undefined,
              })),
            };
          });

      res.json({ success: true, photographers: formatted, total: formatted.length });
    } catch (err: any) {
      console.error('Error fetching photographers:', err);
      res.status(500).json({ success: false, error: err?.message || 'Erro ao buscar fotógrafos' });
    }
  });

  // Get single photographer by slug
  app.get('/api/photographers/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const photoList = await db.select().from(photographers).where(eq(photographers.slug, slug));
      if (!photoList.length) return res.status(404).json({ success: false, error: 'Fotógrafo não encontrado' });
      const p = photoList[0];
      await db.update(photographers)
        .set({ viewsCount: (p.viewsCount || 0) + 1 })
        .where(eq(photographers.id, p.id));
      const pMedia = await db.select().from(photographerMedia).where(eq(photographerMedia.photographerId, p.id));
      const pPkgs = await db.select().from(photographerPackages).where(eq(photographerPackages.photographerId, p.id));
      const pRevs = await db.select().from(reviews).where(eq(reviews.photographerId, p.id));
      const formatted = {
            ...p,
            gallery: pMedia
              .filter((m) => m.type === 'photo')
              .map((m) => ({
                id: String(m.id),
                url: m.url,
                caption: m.caption || '',
                category: m.category || 'Cerimônia',
                featured: m.featured || false,
              })),
            videos: pMedia
              .filter((m) => m.type === 'video')
              .map((m) => ({
                id: String(m.id),
                title: m.caption || 'Vídeo de Casamento',
                thumbnail: m.thumbnail || p.coverImage,
                embedUrl: m.embedUrl || m.url,
                type: 'YouTube',
              })),
            packages: pPkgs.map((k) => ({
              id: String(k.id),
              name: k.name,
              price: k.price,
              popular: k.popular || false,
              description: k.description || '',
              features: (k.features as string[]) || [],
              deliverables: (k.deliverables as string[]) || [],
            })),
            reviews: pRevs.map((r) => ({
              id: String(r.id),
              coupleName: r.coupleName,
              date: r.date,
              weddingLocation: r.weddingLocation || '',
              rating: r.rating,
              comment: r.comment,
              verifiedBooking: r.verifiedBooking || true,
              photographerReply: r.photographerReply || undefined,
            })),
      };
      return res.json({ success: true, photographer: formatted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Create or Update Photographer Profile (Protected for Photographer or Admin)
  app.post(
    '/api/photographers',
    requireAuth,
    requirePhotographerOrAdmin,
    async (req: AuthRequest, res) => {
      try {
        const userUid = req.user!.uid;
        const data = req.body;

        let slug = data.slug;
        if (!slug) {
          slug = (data.studioName || data.name || 'estudio')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-');
        }

        const existingProfile = await db
          .select()
          .from(photographers)
          .where(eq(photographers.userUid, userUid));

          let savedProfile;
          if (existingProfile.length === 0) {
            const [insertRes] = await db.insert(photographers).values({
              userUid,
              slug,
              name: data.name,
              studioName: data.studioName || data.name,
              avatar:
                data.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              coverImage:
                data.coverImage ||
                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
              city: data.city || 'São Paulo',
              state: data.state || 'SP',
              neighborhood: data.neighborhood || '',
              priceStartingFrom: Number(data.priceStartingFrom) || 2500,
              priceCategory: data.priceCategory || 'R$ 2.000 a R$ 5.000',
              styles: data.styles || ['Fine Art'],
              deliverables: data.deliverables || ['Foto', 'Álbum'],
              categories: data.categories || ['Fotógrafos'],
              yearsExperience: Number(data.yearsExperience) || 5,
              weddingsCompleted: Number(data.weddingsCompleted) || 50,
              description: data.description || '',
              bioFull: data.bioFull || '',
              phone: data.phone || '',
              whatsapp: data.whatsapp || '',
              instagram: data.instagram || '',
              website: data.website || '',
              email: data.email || req.user!.email,
              address: data.address || '',
              status: 'approved',
            });
            const newId = (insertRes as any).insertId;
            const fetched = await db
              .select()
              .from(photographers)
              .where(eq(photographers.id, newId));
            savedProfile = fetched[0];
          } else {
            await db
              .update(photographers)
              .set({
                name: data.name,
                studioName: data.studioName,
                avatar: data.avatar,
                coverImage: data.coverImage,
                city: data.city,
                state: data.state,
                neighborhood: data.neighborhood,
                priceStartingFrom: Number(data.priceStartingFrom),
                priceCategory: data.priceCategory,
                styles: data.styles,
                deliverables: data.deliverables,
                categories: data.categories,
                yearsExperience: Number(data.yearsExperience),
                weddingsCompleted: Number(data.weddingsCompleted),
                description: data.description,
                bioFull: data.bioFull,
                phone: data.phone,
                whatsapp: data.whatsapp,
                instagram: data.instagram,
                website: data.website,
                email: data.email,
                address: data.address,
              })
              .where(eq(photographers.userUid, userUid));
            const fetched = await db
              .select()
              .from(photographers)
              .where(eq(photographers.userUid, userUid));
            savedProfile = fetched[0];
          }

        return res.json({
          success: true,
          photographer: savedProfile,
          message: 'Perfil salvo com sucesso no MySQL!',
        });
      } catch (err: any) {
        console.error('Error saving photographer profile:', err);
        res.status(500).json({ success: false, error: err?.message || 'Erro ao salvar perfil' });
      }
    }
  );

  // Post Review for a Photographer
  app.post('/api/photographers/:id/reviews', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const photographerId = Number(req.params.id) || 1;
      const { coupleName, date, weddingLocation, rating, comment, verifiedBooking } = req.body;

      const [insertRes] = await db.insert(reviews).values({
          photographerId,
          userUid: req.user?.uid || null,
          coupleName,
          date,
          weddingLocation: weddingLocation || '',
          rating: Number(rating) || 5,
          comment,
          verifiedBooking: verifiedBooking !== false,
          status: 'approved',
        });

        const newId = (insertRes as any).insertId;
        const fetchedRev = await db.select().from(reviews).where(eq(reviews.id, newId));

        const allRevs = await db
          .select()
          .from(reviews)
          .where(eq(reviews.photographerId, photographerId));
        const count = allRevs.length;
        const avgRating = allRevs.reduce((acc, curr) => acc + curr.rating, 0) / (count || 1);

        await db
          .update(photographers)
          .set({
            reviewCount: count,
            rating: Number(avgRating.toFixed(1)),
          })
          .where(eq(photographers.id, photographerId));

      return res.status(201).json({ success: true, review: fetchedRev[0], message: 'Avaliação enviada com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Reply to Review (Photographer)
  app.post(
    '/api/photographers/:id/reply-review',
    requireAuth,
    requirePhotographerOrAdmin,
    async (req: AuthRequest, res) => {
      try {
        const { reviewId, replyText } = req.body;
        await db
          .update(reviews)
          .set({ photographerReply: replyText })
          .where(eq(reviews.id, Number(reviewId)));

        const fetched = await db.select().from(reviews).where(eq(reviews.id, Number(reviewId)));
        return res.json({ success: true, review: fetched[0] });
      } catch (err: any) {
        res.status(500).json({ success: false, error: err?.message });
      }
    }
  );

  // Add Photo to Gallery
  app.post(
    '/api/photographers/:id/gallery',
    requireAuth,
    requirePhotographerOrAdmin,
    async (req: AuthRequest, res) => {
      try {
        const photographerId = Number(req.params.id) || 1;
        const { url, caption, category, featured, type, thumbnail, embedUrl, sortOrder } = req.body;

        const [insertRes] = await db.insert(photographerMedia).values({
            photographerId,
            type: type || 'photo',
            url,
            caption: caption || '',
            category: category || 'Cerimônia',
            featured: Boolean(featured),
            thumbnail: thumbnail || null,
            embedUrl: embedUrl || null,
            sortOrder: Number(sortOrder) || 0,
          });

          const newId = (insertRes as any).insertId;
          const fetchedMedia = await db
            .select()
            .from(photographerMedia)
            .where(eq(photographerMedia.id, newId));
        return res.status(201).json({ success: true, media: fetchedMedia[0] });
      } catch (err: any) {
        res.status(500).json({ success: false, error: err?.message });
      }
    }
  );

  // Delete Media Item
  app.delete(
    '/api/photographers/media/:mediaId',
    requireAuth,
    requirePhotographerOrAdmin,
    async (req: AuthRequest, res) => {
      try {
        const mediaId = Number(req.params.mediaId);
        await db.delete(photographerMedia).where(eq(photographerMedia.id, mediaId));
        res.json({ success: true, message: 'Mídia removida com sucesso' });
      } catch (err: any) {
        res.status(500).json({ success: false, error: err?.message });
      }
    }
  );

  // Update Gallery Media
  app.patch(
    '/api/photographers/media/:mediaId',
    requireAuth,
    requirePhotographerOrAdmin,
    async (req: AuthRequest, res) => {
      try {
        const mediaId = Number(req.params.mediaId);
        const existing = await db.select().from(photographerMedia).where(eq(photographerMedia.id, mediaId)).limit(1);
        if (!existing.length) return res.status(404).json({ success: false, error: 'Mídia não encontrada.' });

        const owner = await db.select().from(photographers)
          .where(eq(photographers.id, existing[0].photographerId))
          .limit(1);
        const role = String(req.user?.role || '').toLowerCase();
        const isAdmin = role === 'admin' || role === 'super_admin' || role === 'superadmin';
        if (!isAdmin && owner[0]?.userUid !== req.user?.uid) {
          return res.status(403).json({ success: false, error: 'Você não pode alterar esta mídia.' });
        }

        const { caption, category, featured, sortOrder } = req.body;
        await db.update(photographerMedia).set({
          ...(caption !== undefined ? { caption: String(caption) } : {}),
          ...(category !== undefined ? { category: String(category) } : {}),
          ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
          ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
        }).where(eq(photographerMedia.id, mediaId));

        const updated = await db.select().from(photographerMedia).where(eq(photographerMedia.id, mediaId)).limit(1);
        return res.json({ success: true, media: updated[0] });
      } catch (err: any) {
        return res.status(500).json({ success: false, error: err?.message });
      }
    }
  );

  // Add Package
  app.post(
    '/api/photographers/:id/packages',
    requireAuth,
    requirePhotographerOrAdmin,
    async (req: AuthRequest, res) => {
      try {
        const photographerId = Number(req.params.id) || 1;
        const { name, price, description, popular, features, deliverables } = req.body;

        const [insertRes] = await db.insert(photographerPackages).values({
            photographerId,
            name,
            price: Number(price),
            description,
            popular: Boolean(popular),
            features: features || [],
            deliverables: deliverables || [],
          });

          const newId = (insertRes as any).insertId;
          const fetchedPkg = await db
            .select()
            .from(photographerPackages)
            .where(eq(photographerPackages.id, newId));
        return res.status(201).json({ success: true, package: fetchedPkg[0] });
      } catch (err: any) {
        res.status(500).json({ success: false, error: err?.message });
      }
    }
  );

  // --- LEADS & ORÇAMENTOS API ---

  // Get leads (Filtered by photographer ID or all for admin)
  app.get('/api/leads', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { photographerId, photographerSlug } = req.query;

      let allLeads: any[] = await db.select().from(leads).orderBy(desc(leads.createdAt));

      if (photographerSlug) {
        allLeads = allLeads.filter(
          (l) =>
            l.photographerSlug === photographerSlug ||
            (Array.isArray(l.photographerIds) && l.photographerIds.includes(String(photographerSlug)))
        );
      } else if (photographerId) {
        const pId = Number(photographerId);
        allLeads = allLeads.filter((l) => l.photographerId === pId);
      }

      res.json({ success: true, leads: allLeads });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Submit quote lead
  app.post('/api/leads', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const body = req.body;
      const userUid = req.user?.uid || null;

      let photographerId: number | null = null;
      if (body.photographerId && typeof body.photographerId === 'number') {
        photographerId = body.photographerId;
      }

      const [insertRes] = await db.insert(leads).values({
          userUid,
          photographerId,
          coupleName: body.coupleName,
          email: body.email,
          phone: body.phone || '',
          whatsapp: body.whatsapp || '',
          weddingDate: body.weddingDate || '',
          city: body.city || '',
          state: body.state || '',
          venueType: body.venueType || '',
          estimatedGuests: Number(body.estimatedGuests) || 0,
          budgetLimit: Number(body.budgetLimit) || 0,
          servicesNeeded: body.servicesNeeded || [],
          stylePreference: body.stylePreference || '',
          photographerIds: body.photographerIds || (body.photographerId ? [String(body.photographerId)] : []),
          message: body.message || '',
          status: 'Novo',
        });

        const newId = (insertRes as any).insertId;
        const fetchedLead = await db.select().from(leads).where(eq(leads.id, newId));

        if (photographerId) {
          const [photographer] = await db.select({ userUid: photographers.userUid }).from(photographers).where(eq(photographers.id, photographerId)).limit(1);
          if (photographer?.userUid) {
            const [recipient] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.uid, photographer.userUid)).limit(1);
            if (recipient) {
              await NotificationEventService.emit({
                eventType: 'QUOTE_RECEIVED',
                userId: recipient.id,
                userType: 'PHOTOGRAPHER',
                title: 'Novo pedido de orçamento',
                message: `${body.coupleName || 'Um casal'} solicitou um orçamento para ${body.city || 'o casamento'}.`,
                category: 'QUOTE',
                priority: 'HIGH',
                actionUrl: `/painel?orcamento=${newId}`,
                resourceType: 'LEAD',
                resourceId: newId,
                deduplicationKey: `quote-received-${newId}-${recipient.id}`,
              });
            }
          }
        }

      return res.status(201).json({
          success: true,
          message:
            'Solicitação de orçamento enviada com sucesso! O fotógrafo entrará em contato em breve.',
          lead: fetchedLead[0],
        });
    } catch (err: any) {
      console.error('Error submitting lead:', err);
      res.status(500).json({ success: false, error: err?.message || 'Erro ao enviar lead' });
    }
  });

  // Update lead status
  app.patch(
    '/api/leads/:id/status',
    requireAuth,
    requirePhotographerOrAdmin,
    async (req, res) => {
      try {
        const leadId = Number(req.params.id);
        const { status } = req.body;

        await db.update(leads).set({ status }).where(eq(leads.id, leadId));
        const fetched = await db.select().from(leads).where(eq(leads.id, leadId));
        if (!fetched.length) return res.status(404).json({ success: false, error: 'Orçamento não encontrado.' });
        return res.json({ success: true, lead: fetched[0] });
      } catch (err: any) {
        res.status(500).json({ success: false, error: err?.message });
      }
    }
  );

  // ==========================================
  // --- PUBLIC CATEGORIES & LOCATIONS API ---
  // ==========================================

  // Public Categories List
  app.get('/api/categories', async (req, res) => {
    try {
      let activeCategories = await db
        .select()
        .from(categories)
        .where(and(eq(categories.status, 'active'), isNull(categories.deletedAt)))
        .orderBy(asc(categories.sortOrder), asc(categories.name));

      res.json({ success: true, categories: activeCategories });
    } catch (err: any) {
      res.status(503).json({ success: false, error: 'MySQL indisponível.', details: err.message });
    }
  });

  // Public Navigation Locations Section ("Navegação por Estados e Cidades do Brasil")
  app.get('/api/navigation/locations', async (req, res) => {
    try {
      const activeStates = await db
        .select()
        .from(states)
        .where(and(eq(states.showInNavigation, true), eq(states.status, 'active'), isNull(states.deletedAt)))
        .orderBy(asc(states.sortOrder), asc(states.name));

      const activeCities = await db
        .select()
        .from(cities)
        .where(and(eq(cities.showInNavigation, true), eq(cities.status, 'active'), isNull(cities.deletedAt)))
        .orderBy(asc(cities.sortOrder), asc(cities.name));

      const resultStates = activeStates.map((st) => {
        const stateCities = activeCities
          .filter((c) => c.stateId === st.id || c.stateUf === st.uf)
          .map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            featured: c.featured,
            url: c.slug.startsWith('/') ? c.slug : `/${c.slug}`,
          }));

        return {
          id: st.id,
          name: st.name,
          uf: st.uf,
          slug: st.slug,
          photographersCount: st.photographersCount || 0,
          cities: stateCities,
        };
      });

      res.json({ success: true, states: resultStates });
    } catch (err: any) {
      res.status(503).json({ success: false, error: 'MySQL indisponível.', details: err.message });
    }
  });

  // Public State Detail
  app.get('/api/states/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const stateList = await db.select().from(states)
        .where(and(eq(states.slug, slug), isNull(states.deletedAt)));
      const st = stateList[0] || null;
      const stateCities = st ? await db.select().from(cities)
        .where(and(eq(cities.stateUf, st.uf), isNull(cities.deletedAt)))
        .orderBy(asc(cities.sortOrder), asc(cities.name)) : [];

      if (!st) {
        return res.status(404).json({ success: false, error: 'Estado não encontrado' });
      }

      res.json({ success: true, state: st, cities: stateCities });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Public City Detail
  app.get('/api/cities/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const cityList = await db.select().from(cities)
        .where(and(eq(cities.slug, slug), isNull(cities.deletedAt)));
      const cityItem = cityList[0] || null;

      if (!cityItem) {
        return res.status(404).json({ success: false, error: 'Cidade não encontrada' });
      }

      res.json({ success: true, city: cityItem });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Legacy-compatible public routes, backed exclusively by MySQL.
  app.get('/api/states', async (req, res) => {
    try {
      const statesList = await db.select().from(states)
        .where(isNull(states.deletedAt))
        .orderBy(asc(states.sortOrder), asc(states.name));

      res.json({ success: true, states: statesList });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.get('/api/cities', async (req, res) => {
    try {
      const citiesList = await db.select().from(cities)
        .where(isNull(cities.deletedAt))
        .orderBy(asc(cities.sortOrder), asc(cities.name));

      res.json({ success: true, cities: citiesList });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // --- ADMIN CATEGORIES MANAGEMENT APIS ---
  // ==========================================

  // GET /api/admin/categories
  app.get('/api/admin/categories', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { search, status, page = 1, limit = 20 } = req.query;
      let allCats: any[] = [];
      const countMap: Record<number, number> = {};

      allCats = await db.select().from(categories)
        .where(isNull(categories.deletedAt))
        .orderBy(asc(categories.sortOrder), asc(categories.name));

      const photoCats = await db.select().from(photographerCategories);
      const photoList = await db.select().from(photographers);

        photoCats.forEach((pc) => {
          countMap[pc.categoryId] = (countMap[pc.categoryId] || 0) + 1;
        });

      photoList.forEach((p) => {
        if (Array.isArray(p.categories)) {
          allCats.forEach((c) => {
            if (p.categories.includes(c.name)) countMap[c.id] = (countMap[c.id] || 0) + 1;
          });
        }
      });

      let filtered = allCats.map((c) => ({
        ...c,
        photographersCount: countMap[c.id] || 0,
      }));

      if (search) {
        const term = String(search).toLowerCase();
        filtered = filtered.filter((c) => c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term));
      }

      if (status && status !== 'all') {
        filtered = filtered.filter((c) => c.status === status);
      }

      const total = filtered.length;
      const p = Math.max(1, Number(page));
      const l = Math.max(1, Number(limit));
      const start = (p - 1) * l;
      const paginated = filtered.slice(start, start + l);

      res.json({
        success: true,
        categories: paginated,
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/admin/categories
  app.post('/api/admin/categories', requireAuth, requireAdmin, async (req, res) => {
    try {
      const body = req.body;
      if (!body.name || !body.name.trim()) {
        return res.status(400).json({ success: false, error: 'Nome da categoria é obrigatório.' });
      }

      let slug = body.slug
        ? body.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-')
        : body.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-');

      // Check unique slug
      const existingSlug = await db
        .select()
        .from(categories)
        .where(and(eq(categories.slug, slug), isNull(categories.deletedAt)));
      if (existingSlug.length > 0) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const [insertRes] = await db.insert(categories).values({
        parentId: body.parentId ? Number(body.parentId) : null,
        name: body.name.trim(),
        slug,
        shortDescription: body.shortDescription || null,
        description: body.description || null,
        icon: body.icon || 'Camera',
        image: body.image || null,
        iconColor: body.iconColor || '#C88E9B',
        seoTitle: body.seoTitle || `${body.name} | Guia Fotógrafo Casamento`,
        seoDescription: body.seoDescription || null,
        focusKeyword: body.focusKeyword || null,
        showOnHome: body.showOnHome === true,
        showOnSearch: body.showOnSearch !== false,
        sortOrder: Number(body.sortOrder) || 0,
        status: body.status || 'active',
      });

      const newId = (insertRes as any).insertId;
      const fetched = await db.select().from(categories).where(eq(categories.id, newId));

      res.status(201).json({
        success: true,
        category: fetched[0],
        message: 'Categoria criada com sucesso!',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Erro ao criar categoria' });
    }
  });

  // GET /api/admin/categories/:id
  app.get('/api/admin/categories/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const item = await db.select().from(categories).where(eq(categories.id, id));
      if (item.length === 0) {
        return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
      }
      res.json({ success: true, category: item[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // PUT /api/admin/categories/:id
  app.put('/api/admin/categories/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const body = req.body;

      const existing = await db.select().from(categories).where(eq(categories.id, id));
      if (existing.length === 0) {
        return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
      }

      let slug = body.slug ? body.slug.toLowerCase().trim() : existing[0].slug;

      await db
        .update(categories)
        .set({
          parentId: body.parentId ? Number(body.parentId) : null,
          name: body.name || existing[0].name,
          slug,
          shortDescription: body.shortDescription,
          description: body.description,
          icon: body.icon,
          image: body.image,
          iconColor: body.iconColor,
          seoTitle: body.seoTitle,
          seoDescription: body.seoDescription,
          focusKeyword: body.focusKeyword,
          showOnHome: Boolean(body.showOnHome),
          showOnSearch: Boolean(body.showOnSearch),
          sortOrder: Number(body.sortOrder) || 0,
          status: body.status || 'active',
        })
        .where(eq(categories.id, id));

      const updated = await db.select().from(categories).where(eq(categories.id, id));
      res.json({ success: true, category: updated[0], message: 'Categoria atualizada com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // PATCH /api/admin/categories/:id/status
  app.patch('/api/admin/categories/:id/status', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      await db.update(categories).set({ status }).where(eq(categories.id, id));
      const updated = await db.select().from(categories).where(eq(categories.id, id));
      res.json({ success: true, category: updated[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // DELETE /api/admin/categories/:id
  app.delete('/api/admin/categories/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const targetCat = await db.select().from(categories).where(eq(categories.id, id));
      if (targetCat.length === 0) {
        return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
      }

      // Check if photographers are linked
      const linkedDirect = await db
        .select()
        .from(photographerCategories)
        .where(eq(photographerCategories.categoryId, id));

      const catName = targetCat[0].name;
      const allPhotos = await db.select().from(photographers);
      const linkedJson = allPhotos.filter(
        (p) => Array.isArray(p.categories) && p.categories.includes(catName)
      );

      const totalLinked = linkedDirect.length + linkedJson.length;

      if (totalLinked > 0) {
        return res.status(400).json({
          success: false,
          hasLinkedPhotographers: true,
          error:
            'Esta categoria possui fotógrafos vinculados. Selecione uma categoria substituta ou remova os vínculos antes de excluir.',
        });
      }

      // Soft delete
      await db
        .update(categories)
        .set({ deletedAt: new Date(), status: 'inactive' })
        .where(eq(categories.id, id));

      res.json({ success: true, message: 'Categoria excluída com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // PATCH /api/admin/categories/reorder
  app.patch('/api/admin/categories/reorder', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { items } = req.body; // Array of { id, sortOrder }
      if (Array.isArray(items)) {
        for (const item of items) {
          await db
            .update(categories)
            .set({ sortOrder: Number(item.sortOrder) || 0 })
            .where(eq(categories.id, Number(item.id)));
        }
      }
      res.json({ success: true, message: 'Ordem das categorias atualizada com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // --- ADMIN STATES MANAGEMENT APIS ---
  // ==========================================

  // GET /api/admin/states
  app.get('/api/admin/states', requireAuth, requireAdmin, async (req, res) => {
    try {
      const allStates = await db
        .select()
        .from(states)
        .where(isNull(states.deletedAt))
        .orderBy(asc(states.sortOrder), asc(states.name));

      const allCities = await db.select().from(cities).where(isNull(cities.deletedAt));
      const allPhotos = await db.select().from(photographers);

      const cityCountMap: Record<string, number> = {};
      allCities.forEach((c) => {
        cityCountMap[c.stateUf] = (cityCountMap[c.stateUf] || 0) + 1;
      });

      const photoCountMap: Record<string, number> = {};
      allPhotos.forEach((p) => {
        if (p.state) {
          const uf = p.state.toUpperCase();
          photoCountMap[uf] = (photoCountMap[uf] || 0) + 1;
        }
      });

      const result = allStates.map((st) => ({
        ...st,
        citiesCount: cityCountMap[st.uf] || 0,
        photographersCount: photoCountMap[st.uf] || st.photographersCount || 0,
      }));

      res.json({ success: true, states: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/admin/states
  app.post('/api/admin/states', requireAuth, requireAdmin, async (req, res) => {
    try {
      const body = req.body;
      if (!body.name || !body.uf) {
        return res.status(400).json({ success: false, error: 'Nome do estado e UF são obrigatórios.' });
      }

      const uf = body.uf.toUpperCase().trim();
      const slug = body.slug
        ? body.slug.toLowerCase().trim()
        : body.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');

      const existingUf = await db.select().from(states).where(eq(states.uf, uf));
      if (existingUf.length > 0) {
        return res.status(400).json({ success: false, error: `Já existe um estado cadastrado com a UF "${uf}".` });
      }

      const [insertRes] = await db.insert(states).values({
        name: body.name.trim(),
        uf,
        slug,
        ibgeCode: body.ibgeCode || null,
        region: body.region || 'Sudeste',
        image: body.image || null,
        introductoryText: body.introductoryText || null,
        seoTitle: body.seoTitle || `Fotógrafos de Casamento em ${body.name} - ${uf}`,
        seoDescription: body.seoDescription || null,
        showInNavigation: body.showInNavigation !== false,
        sortOrder: Number(body.sortOrder) || 0,
        status: body.status || 'active',
      });

      const newId = (insertRes as any).insertId;
      const fetched = await db.select().from(states).where(eq(states.id, newId));

      res.status(201).json({ success: true, state: fetched[0], message: 'Estado cadastrado com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // GET /api/admin/states/:id
  app.get('/api/admin/states/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const item = await db.select().from(states).where(eq(states.id, id));
      if (item.length === 0) return res.status(404).json({ success: false, error: 'Estado não encontrado' });
      res.json({ success: true, state: item[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // PUT /api/admin/states/:id
  app.put('/api/admin/states/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const body = req.body;

      const existing = await db.select().from(states).where(eq(states.id, id));
      if (existing.length === 0) return res.status(404).json({ success: false, error: 'Estado não encontrado' });

      await db
        .update(states)
        .set({
          name: body.name || existing[0].name,
          uf: body.uf ? body.uf.toUpperCase() : existing[0].uf,
          slug: body.slug || existing[0].slug,
          ibgeCode: body.ibgeCode,
          region: body.region,
          image: body.image,
          introductoryText: body.introductoryText,
          seoTitle: body.seoTitle,
          seoDescription: body.seoDescription,
          showInNavigation: Boolean(body.showInNavigation),
          sortOrder: Number(body.sortOrder) || 0,
          status: body.status || 'active',
        })
        .where(eq(states.id, id));

      const updated = await db.select().from(states).where(eq(states.id, id));
      res.json({ success: true, state: updated[0], message: 'Estado atualizado com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // PATCH /api/admin/states/:id/status
  app.patch('/api/admin/states/:id/status', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      await db.update(states).set({ status }).where(eq(states.id, id));
      const updated = await db.select().from(states).where(eq(states.id, id));
      res.json({ success: true, state: updated[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // DELETE /api/admin/states/:id
  app.delete('/api/admin/states/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const targetState = await db.select().from(states).where(eq(states.id, id));
      if (targetState.length === 0) return res.status(404).json({ success: false, error: 'Estado não encontrado' });

      // Check linked cities
      const linkedCities = await db
        .select()
        .from(cities)
        .where(and(or(eq(cities.stateId, id), eq(cities.stateUf, targetState[0].uf)), isNull(cities.deletedAt)));

      if (linkedCities.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Este estado não pode ser excluído pois possui ${linkedCities.length} cidades vinculadas. Exclua ou reatribua as cidades primeiro.`,
        });
      }

      await db.update(states).set({ deletedAt: new Date(), status: 'inactive' }).where(eq(states.id, id));
      res.json({ success: true, message: 'Estado excluído com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // PATCH /api/admin/states/reorder
  app.patch('/api/admin/states/reorder', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { items } = req.body;
      if (Array.isArray(items)) {
        for (const item of items) {
          await db.update(states).set({ sortOrder: Number(item.sortOrder) || 0 }).where(eq(states.id, Number(item.id)));
        }
      }
      res.json({ success: true, message: 'Ordem dos estados atualizada!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // --- ADMIN CITIES MANAGEMENT APIS ---
  // ==========================================

  // GET /api/admin/cities
  app.get('/api/admin/cities', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { stateUf, stateId, region, status, showInNavigation, featured, search, page = 1, limit = 20 } = req.query;

      let allCities = await db
        .select()
        .from(cities)
        .where(isNull(cities.deletedAt))
        .orderBy(asc(cities.sortOrder), asc(cities.name));

      const allStates = await db.select().from(states);
      const stateMapByUf: Record<string, any> = {};
      const stateMapById: Record<number, any> = {};
      allStates.forEach((st) => {
        stateMapByUf[st.uf] = st;
        stateMapById[st.id] = st;
      });

      const allPhotos = await db.select().from(photographers);
      const cityPhotoCount: Record<string, number> = {};
      allPhotos.forEach((p) => {
        if (p.city) {
          const key = p.city.toLowerCase();
          cityPhotoCount[key] = (cityPhotoCount[key] || 0) + 1;
        }
      });

      let filtered = allCities.map((c) => {
        const parentState = stateMapById[c.stateId || 0] || stateMapByUf[c.stateUf] || null;
        return {
          ...c,
          stateName: parentState ? parentState.name : c.stateUf,
          region: parentState ? parentState.region : 'Sudeste',
          photographersCount: cityPhotoCount[c.name.toLowerCase()] || 0,
        };
      });

      if (stateUf) {
        filtered = filtered.filter((c) => c.stateUf.toUpperCase() === String(stateUf).toUpperCase());
      }
      if (stateId) {
        filtered = filtered.filter((c) => Number(c.stateId) === Number(stateId));
      }
      if (region && region !== 'all') {
        filtered = filtered.filter((c) => c.region === region);
      }
      if (status && status !== 'all') {
        filtered = filtered.filter((c) => c.status === status);
      }
      if (showInNavigation !== undefined && showInNavigation !== 'all') {
        filtered = filtered.filter((c) => String(c.showInNavigation) === String(showInNavigation));
      }
      if (featured !== undefined && featured !== 'all') {
        filtered = filtered.filter((c) => String(c.featured) === String(featured));
      }
      if (search) {
        const term = String(search).toLowerCase();
        filtered = filtered.filter((c) => c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term));
      }

      const total = filtered.length;
      const p = Math.max(1, Number(page));
      const l = Math.max(1, Number(limit));
      const start = (p - 1) * l;
      const paginated = filtered.slice(start, start + l);

      res.json({
        success: true,
        cities: paginated,
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/admin/cities
  app.post('/api/admin/cities', requireAuth, requireAdmin, async (req, res) => {
    try {
      const body = req.body;
      if (!body.name || (!body.stateUf && !body.stateId)) {
        return res.status(400).json({ success: false, error: 'Nome da cidade e Estado são obrigatórios.' });
      }

      let stateUf = body.stateUf ? body.stateUf.toUpperCase() : '';
      let stateId = body.stateId ? Number(body.stateId) : null;

      if (!stateUf && stateId) {
        const st = await db.select().from(states).where(eq(states.id, stateId));
        if (st.length > 0) stateUf = st[0].uf;
      } else if (!stateId && stateUf) {
        const st = await db.select().from(states).where(eq(states.uf, stateUf));
        if (st.length > 0) stateId = st[0].id;
      }

      // Check duplicate city in same state
      const existingCityInState = await db
        .select()
        .from(cities)
        .where(
          and(
            eq(cities.stateUf, stateUf),
            eq(cities.name, body.name.trim()),
            isNull(cities.deletedAt)
          )
        );

      if (existingCityInState.length > 0) {
        return res.status(400).json({
          success: false,
          error: `A cidade "${body.name}" já está cadastrada no estado ${stateUf}.`,
        });
      }

      let slug = body.slug
        ? body.slug.toLowerCase().trim()
        : `fotografo-casamento-${body.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}`;

      // Unique slug check
      const existingSlug = await db
        .select()
        .from(cities)
        .where(and(eq(cities.slug, slug), isNull(cities.deletedAt)));
      if (existingSlug.length > 0) {
        slug = `${slug}-${stateUf.toLowerCase()}`;
      }

      const [insertRes] = await db.insert(cities).values({
        stateId,
        stateUf,
        name: body.name.trim(),
        slug,
        ibgeCode: body.ibgeCode || null,
        latitude: body.latitude ? Number(body.latitude) : null,
        longitude: body.longitude ? Number(body.longitude) : null,
        image: body.image || null,
        introductoryText: body.introductoryText || null,
        heroText: body.heroText || `Fotógrafos de Casamento em ${body.name}`,
        seoTitle: body.seoTitle || `Fotógrafos de Casamento em ${body.name} - ${stateUf}`,
        seoDescription: body.seoDescription || null,
        focusKeyword: body.focusKeyword || `fotografo casamento ${body.name.toLowerCase()}`,
        showInNavigation: body.showInNavigation !== false,
        featured: Boolean(body.featured),
        sortOrder: Number(body.sortOrder) || 0,
        status: body.status || 'active',
      });

      const newId = (insertRes as any).insertId;
      const fetched = await db.select().from(cities).where(eq(cities.id, newId));

      res.status(201).json({ success: true, city: fetched[0], message: 'Cidade cadastrada com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // GET /api/admin/cities/:id
  app.get('/api/admin/cities/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const item = await db.select().from(cities).where(eq(cities.id, id));
      if (item.length === 0) return res.status(404).json({ success: false, error: 'Cidade não encontrada' });
      res.json({ success: true, city: item[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // PUT /api/admin/cities/:id
  app.put('/api/admin/cities/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const body = req.body;

      const existing = await db.select().from(cities).where(eq(cities.id, id));
      if (existing.length === 0) return res.status(404).json({ success: false, error: 'Cidade não encontrada' });

      let stateUf = body.stateUf ? body.stateUf.toUpperCase() : existing[0].stateUf;
      let stateId = body.stateId ? Number(body.stateId) : existing[0].stateId;

      await db
        .update(cities)
        .set({
          stateId,
          stateUf,
          name: body.name || existing[0].name,
          slug: body.slug || existing[0].slug,
          ibgeCode: body.ibgeCode,
          latitude: body.latitude ? Number(body.latitude) : null,
          longitude: body.longitude ? Number(body.longitude) : null,
          image: body.image,
          introductoryText: body.introductoryText,
          heroText: body.heroText,
          seoTitle: body.seoTitle,
          seoDescription: body.seoDescription,
          focusKeyword: body.focusKeyword,
          showInNavigation: Boolean(body.showInNavigation),
          featured: Boolean(body.featured),
          sortOrder: Number(body.sortOrder) || 0,
          status: body.status || 'active',
        })
        .where(eq(cities.id, id));

      const updated = await db.select().from(cities).where(eq(cities.id, id));
      res.json({ success: true, city: updated[0], message: 'Cidade atualizada com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // PATCH /api/admin/cities/:id/status
  app.patch('/api/admin/cities/:id/status', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      await db.update(cities).set({ status }).where(eq(cities.id, id));
      const updated = await db.select().from(cities).where(eq(cities.id, id));
      res.json({ success: true, city: updated[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // DELETE /api/admin/cities/:id
  app.delete('/api/admin/cities/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.update(cities).set({ deletedAt: new Date(), status: 'inactive' }).where(eq(cities.id, id));
      res.json({ success: true, message: 'Cidade excluída com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // PATCH /api/admin/cities/reorder
  app.patch('/api/admin/cities/reorder', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { items } = req.body;
      if (Array.isArray(items)) {
        for (const item of items) {
          await db.update(cities).set({ sortOrder: Number(item.sortOrder) || 0 }).where(eq(cities.id, Number(item.id)));
        }
      }
      res.json({ success: true, message: 'Ordem das cidades atualizada!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // --- COMMERCIAL PLANS MANAGEMENT APIS ---
  // ==========================================

  // GET /api/plans (Public)
  app.get('/api/plans', async (req, res) => {
    try {
      const activePlans = await db
        .select()
        .from(subscriptionPlans)
        .where(and(eq(subscriptionPlans.status, 'active'), isNull(subscriptionPlans.deletedAt)))
        .orderBy(asc(subscriptionPlans.sortOrder), asc(subscriptionPlans.id));

      const plansWithDetails = await Promise.all(
        activePlans.map(async (plan) => {
          const items = await db
            .select()
            .from(subscriptionPlanItems)
            .where(and(eq(subscriptionPlanItems.planId, plan.id), isNull(subscriptionPlanItems.deletedAt)))
            .orderBy(asc(subscriptionPlanItems.sortOrder), asc(subscriptionPlanItems.id));

          const features = await db
            .select()
            .from(subscriptionPlanFeatures)
            .where(eq(subscriptionPlanFeatures.planId, plan.id));

          return {
            ...plan,
            items,
            features,
          };
        })
      );

      res.json({ success: true, plans: plansWithDetails });
    } catch (err: any) {
      console.error('Error fetching public plans:', err);
      res.status(500).json({ success: false, error: err?.message || 'Erro ao carregar planos' });
    }
  });

  // GET /api/admin/plans (Admin)
  app.get('/api/admin/plans', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { q, status, billing, page = 1, limit = 50 } = req.query;

      let allPlans = await db
        .select()
        .from(subscriptionPlans)
        .where(isNull(subscriptionPlans.deletedAt))
        .orderBy(asc(subscriptionPlans.sortOrder), asc(subscriptionPlans.id));

      // Filter by search query
      if (q && typeof q === 'string' && q.trim()) {
        const queryClean = q.toLowerCase().trim();
        allPlans = allPlans.filter(
          (p) =>
            p.name.toLowerCase().includes(queryClean) ||
            (p.internalName && p.internalName.toLowerCase().includes(queryClean)) ||
            (p.internalCode && p.internalCode.toLowerCase().includes(queryClean)) ||
            p.slug.toLowerCase().includes(queryClean)
        );
      }

      // Filter by status
      if (status && status !== 'all') {
        allPlans = allPlans.filter((p) => p.status === status);
      }

      // Filter by billing type
      if (billing && billing !== 'all') {
        if (billing === 'free') {
          allPlans = allPlans.filter((p) => p.isFree);
        } else if (billing === 'monthly') {
          allPlans = allPlans.filter((p) => !p.isFree && p.allowMonthlyBilling);
        } else if (billing === 'annual') {
          allPlans = allPlans.filter((p) => !p.isFree && p.allowAnnualBilling);
        }
      }

      // Attach details + subscriber counts
      const plansWithDetails = await Promise.all(
        allPlans.map(async (plan) => {
          const items = await db
            .select()
            .from(subscriptionPlanItems)
            .where(and(eq(subscriptionPlanItems.planId, plan.id), isNull(subscriptionPlanItems.deletedAt)))
            .orderBy(asc(subscriptionPlanItems.sortOrder), asc(subscriptionPlanItems.id));

          const features = await db
            .select()
            .from(subscriptionPlanFeatures)
            .where(eq(subscriptionPlanFeatures.planId, plan.id));

          // Get subscriber count
          const subs = await db
            .select()
            .from(subscriptions)
            .where(and(eq(subscriptions.planId, plan.id), eq(subscriptions.status, 'active')));

          return {
            ...plan,
            items,
            features,
            subscribersCount: subs.length,
          };
        })
      );

      const p = Number(page) || 1;
      const l = Number(limit) || 50;
      const total = plansWithDetails.length;
      const paginatedPlans = plansWithDetails.slice((p - 1) * l, p * l);

      res.json({
        success: true,
        plans: paginatedPlans,
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      });
    } catch (err: any) {
      console.error('Error fetching admin plans:', err);
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // GET /api/admin/plans/:id (Admin)
  app.get('/api/admin/plans/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const plan = await db.select().from(subscriptionPlans).where(and(eq(subscriptionPlans.id, id), isNull(subscriptionPlans.deletedAt)));
      if (plan.length === 0) {
        return res.status(404).json({ success: false, error: 'Plano não encontrado' });
      }

      const items = await db
        .select()
        .from(subscriptionPlanItems)
        .where(and(eq(subscriptionPlanItems.planId, id), isNull(subscriptionPlanItems.deletedAt)))
        .orderBy(asc(subscriptionPlanItems.sortOrder), asc(subscriptionPlanItems.id));

      const features = await db
        .select()
        .from(subscriptionPlanFeatures)
        .where(eq(subscriptionPlanFeatures.planId, id));

      const subs = await db
        .select()
        .from(subscriptions)
        .where(and(eq(subscriptions.planId, id), eq(subscriptions.status, 'active')));

      res.json({
        success: true,
        plan: {
          ...plan[0],
          items,
          features,
          subscribersCount: subs.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/admin/plans (Admin)
  app.post('/api/admin/plans', requireAuth, requireAdmin, async (req, res) => {
    try {
      const body = req.body;
      if (!body.name || !body.name.trim()) {
        return res.status(400).json({ success: false, error: 'Nome público do plano é obrigatório.' });
      }

      let slug = body.slug
        ? body.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-')
        : body.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-');

      // Check unique slug
      const existingSlug = await db
        .select()
        .from(subscriptionPlans)
        .where(and(eq(subscriptionPlans.slug, slug), isNull(subscriptionPlans.deletedAt)));
      if (existingSlug.length > 0) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      // Check unique internal_code if provided
      if (body.internalCode && body.internalCode.trim()) {
        const existingCode = await db
          .select()
          .from(subscriptionPlans)
          .where(and(eq(subscriptionPlans.internalCode, body.internalCode.trim()), isNull(subscriptionPlans.deletedAt)));
        if (existingCode.length > 0) {
          return res.status(400).json({ success: false, error: `Código interno '${body.internalCode}' já está em uso.` });
        }
      }

      // If set as recommended, un-recommend others
      if (body.isRecommended === true) {
        await db.update(subscriptionPlans).set({ isRecommended: false });
      }

      // Parse prices
      const isFree = Boolean(body.isFree);
      const monthlyPrice = isFree ? '0.00' : String(Number(body.monthlyPrice) || 0);
      const annualPrice = isFree ? '0.00' : String(Number(body.annualPrice) || 0);

      // Auto calculations
      const mPriceNum = Number(monthlyPrice);
      const aPriceNum = Number(annualPrice);

      let annualMonthlyEquivalent = body.annualMonthlyEquivalent ? String(body.annualMonthlyEquivalent) : null;
      let annualSavingsAmount = body.annualSavingsAmount ? String(body.annualSavingsAmount) : null;
      let annualDiscountPercentage = body.annualDiscountPercentage ? String(body.annualDiscountPercentage) : null;

      if (!isFree && mPriceNum > 0 && aPriceNum > 0) {
        const fullYearMonthly = mPriceNum * 12;
        if (!annualSavingsAmount) {
          annualSavingsAmount = (fullYearMonthly - aPriceNum).toFixed(2);
        }
        if (!annualDiscountPercentage) {
          annualDiscountPercentage = (((fullYearMonthly - aPriceNum) / fullYearMonthly) * 100).toFixed(2);
        }
        if (!annualMonthlyEquivalent) {
          annualMonthlyEquivalent = (aPriceNum / 12).toFixed(2);
        }
      }

      const [insertRes] = await db.insert(subscriptionPlans).values({
        name: body.name.trim(),
        internalName: body.internalName ? body.internalName.trim() : null,
        slug,
        internalCode: body.internalCode ? body.internalCode.trim() : null,
        shortDescription: body.shortDescription || null,
        description: body.description || null,
        currency: body.currency || 'BRL',
        isFree,
        monthlyPrice,
        annualPrice,
        promotionalMonthlyPrice: body.promotionalMonthlyPrice ? String(body.promotionalMonthlyPrice) : null,
        promotionalAnnualPrice: body.promotionalAnnualPrice ? String(body.promotionalAnnualPrice) : null,
        annualMonthlyEquivalent,
        annualSavingsAmount,
        annualDiscountPercentage,
        setupFee: body.setupFee ? String(body.setupFee) : '0.00',
        trialEnabled: Boolean(body.trialEnabled),
        trialDays: Number(body.trialDays) || 0,
        promotionStartAt: body.promotionStartAt ? new Date(body.promotionStartAt) : null,
        promotionEndAt: body.promotionEndAt ? new Date(body.promotionEndAt) : null,
        mainColor: body.mainColor || '#C88E9B',
        textColor: body.textColor || '#5A4035',
        buttonColor: body.buttonColor || '#C88E9B',
        icon: body.icon || 'Sparkles',
        badgeText: body.badgeText || null,
        buttonText: body.buttonText || 'Assinar Agora',
        buttonUrl: body.buttonUrl || null,
        buttonTarget: body.buttonTarget || '_self',
        textAbovePrice: body.textAbovePrice || null,
        textBelowPrice: body.textBelowPrice || null,
        isRecommended: Boolean(body.isRecommended),
        isPremium: Boolean(body.isPremium),
        isFeatured: Boolean(body.isFeatured),
        showOnHome: body.showOnHome !== false,
        showOnPricingPage: body.showOnPricingPage !== false,
        showOnRegistration: body.showOnRegistration !== false,
        showOnProfessionalDashboard: body.showOnProfessionalDashboard !== false,
        allowMonthlyBilling: body.allowMonthlyBilling !== false,
        allowAnnualBilling: body.allowAnnualBilling !== false,
        allowCancel: body.allowCancel !== false,
        allowUpgrade: body.allowUpgrade !== false,
        allowDowngrade: body.allowDowngrade !== false,
        sortOrder: Number(body.sortOrder) || 0,
        status: body.status || 'active',
      });

      const newPlanId = (insertRes as any).insertId;

      // Insert Items if provided
      if (Array.isArray(body.items) && body.items.length > 0) {
        for (let idx = 0; idx < body.items.length; idx++) {
          const item = body.items[idx];
          if (item.title && item.title.trim()) {
            await db.insert(subscriptionPlanItems).values({
              planId: newPlanId,
              title: item.title.trim(),
              description: item.description || null,
              icon: item.icon || null,
              isIncluded: item.isIncluded !== false,
              isFeatured: Boolean(item.isFeatured),
              limitValue: item.limitValue ? String(item.limitValue) : null,
              isUnlimited: Boolean(item.isUnlimited),
              displayText: item.displayText || null,
              sortOrder: Number(item.sortOrder) || idx + 1,
              status: item.status || 'active',
            });
          }
        }
      }

      // Insert Features if provided
      if (Array.isArray(body.features) && body.features.length > 0) {
        for (const feat of body.features) {
          if (feat.featureKey) {
            await db.insert(subscriptionPlanFeatures).values({
              planId: newPlanId,
              featureKey: feat.featureKey,
              featureName: feat.featureName || feat.featureKey,
              featureType: feat.featureType || 'boolean',
              booleanValue: Boolean(feat.booleanValue),
              numericValue: feat.numericValue !== undefined && feat.numericValue !== null ? Number(feat.numericValue) : null,
              textValue: feat.textValue || null,
              isUnlimited: Boolean(feat.isUnlimited),
            });
          }
        }
      }

      const createdPlan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, newPlanId));
      const createdItems = await db.select().from(subscriptionPlanItems).where(and(eq(subscriptionPlanItems.planId, newPlanId), isNull(subscriptionPlanItems.deletedAt)));
      const createdFeatures = await db.select().from(subscriptionPlanFeatures).where(eq(subscriptionPlanFeatures.planId, newPlanId));

      res.status(201).json({
        success: true,
        plan: {
          ...createdPlan[0],
          items: createdItems,
          features: createdFeatures,
          subscribersCount: 0,
        },
        message: 'Plano criado com sucesso!',
      });
    } catch (err: any) {
      console.error('Error creating plan:', err);
      res.status(500).json({ success: false, error: err?.message || 'Erro ao criar plano' });
    }
  });

  // PUT /api/admin/plans/:id (Admin)
  app.put('/api/admin/plans/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const body = req.body;

      const existing = await db.select().from(subscriptionPlans).where(and(eq(subscriptionPlans.id, id), isNull(subscriptionPlans.deletedAt)));
      if (existing.length === 0) {
        return res.status(404).json({ success: false, error: 'Plano não encontrado' });
      }

      let slug = body.slug ? body.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-') : existing[0].slug;

      // Check slug collision
      if (slug !== existing[0].slug) {
        const slugCheck = await db
          .select()
          .from(subscriptionPlans)
          .where(and(eq(subscriptionPlans.slug, slug), isNull(subscriptionPlans.deletedAt)));
        if (slugCheck.length > 0) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
      }

      // Check internal_code collision
      if (body.internalCode && body.internalCode.trim() !== existing[0].internalCode) {
        const codeCheck = await db
          .select()
          .from(subscriptionPlans)
          .where(and(eq(subscriptionPlans.internalCode, body.internalCode.trim()), isNull(subscriptionPlans.deletedAt)));
        if (codeCheck.length > 0) {
          return res.status(400).json({ success: false, error: `Código interno '${body.internalCode}' já está em uso por outro plano.` });
        }
      }

      // If recommended true, unmark others
      if (body.isRecommended === true && existing[0].isRecommended !== true) {
        await db.update(subscriptionPlans).set({ isRecommended: false });
      }

      const isFree = Boolean(body.isFree);
      const monthlyPrice = isFree ? '0.00' : String(Number(body.monthlyPrice) || 0);
      const annualPrice = isFree ? '0.00' : String(Number(body.annualPrice) || 0);

      // Calculations
      const mPriceNum = Number(monthlyPrice);
      const aPriceNum = Number(annualPrice);

      let annualMonthlyEquivalent = body.annualMonthlyEquivalent ? String(body.annualMonthlyEquivalent) : null;
      let annualSavingsAmount = body.annualSavingsAmount ? String(body.annualSavingsAmount) : null;
      let annualDiscountPercentage = body.annualDiscountPercentage ? String(body.annualDiscountPercentage) : null;

      if (!isFree && mPriceNum > 0 && aPriceNum > 0) {
        const fullYearMonthly = mPriceNum * 12;
        if (!annualSavingsAmount) {
          annualSavingsAmount = (fullYearMonthly - aPriceNum).toFixed(2);
        }
        if (!annualDiscountPercentage) {
          annualDiscountPercentage = (((fullYearMonthly - aPriceNum) / fullYearMonthly) * 100).toFixed(2);
        }
        if (!annualMonthlyEquivalent) {
          annualMonthlyEquivalent = (aPriceNum / 12).toFixed(2);
        }
      }

      await db
        .update(subscriptionPlans)
        .set({
          name: body.name ? body.name.trim() : existing[0].name,
          internalName: body.internalName !== undefined ? (body.internalName ? body.internalName.trim() : null) : existing[0].internalName,
          slug,
          internalCode: body.internalCode !== undefined ? (body.internalCode ? body.internalCode.trim() : null) : existing[0].internalCode,
          shortDescription: body.shortDescription !== undefined ? body.shortDescription : existing[0].shortDescription,
          description: body.description !== undefined ? body.description : existing[0].description,
          currency: body.currency || existing[0].currency,
          isFree,
          monthlyPrice,
          annualPrice,
          promotionalMonthlyPrice: body.promotionalMonthlyPrice ? String(body.promotionalMonthlyPrice) : null,
          promotionalAnnualPrice: body.promotionalAnnualPrice ? String(body.promotionalAnnualPrice) : null,
          annualMonthlyEquivalent,
          annualSavingsAmount,
          annualDiscountPercentage,
          setupFee: body.setupFee !== undefined ? String(body.setupFee) : existing[0].setupFee,
          trialEnabled: body.trialEnabled !== undefined ? Boolean(body.trialEnabled) : existing[0].trialEnabled,
          trialDays: body.trialDays !== undefined ? Number(body.trialDays) : existing[0].trialDays,
          promotionStartAt: body.promotionStartAt ? new Date(body.promotionStartAt) : null,
          promotionEndAt: body.promotionEndAt ? new Date(body.promotionEndAt) : null,
          mainColor: body.mainColor || existing[0].mainColor,
          textColor: body.textColor || existing[0].textColor,
          buttonColor: body.buttonColor || existing[0].buttonColor,
          icon: body.icon || existing[0].icon,
          badgeText: body.badgeText !== undefined ? body.badgeText : existing[0].badgeText,
          buttonText: body.buttonText || existing[0].buttonText,
          buttonUrl: body.buttonUrl !== undefined ? body.buttonUrl : existing[0].buttonUrl,
          buttonTarget: body.buttonTarget || existing[0].buttonTarget,
          textAbovePrice: body.textAbovePrice !== undefined ? body.textAbovePrice : existing[0].textAbovePrice,
          textBelowPrice: body.textBelowPrice !== undefined ? body.textBelowPrice : existing[0].textBelowPrice,
          isRecommended: body.isRecommended !== undefined ? Boolean(body.isRecommended) : existing[0].isRecommended,
          isPremium: body.isPremium !== undefined ? Boolean(body.isPremium) : existing[0].isPremium,
          isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing[0].isFeatured,
          showOnHome: body.showOnHome !== undefined ? Boolean(body.showOnHome) : existing[0].showOnHome,
          showOnPricingPage: body.showOnPricingPage !== undefined ? Boolean(body.showOnPricingPage) : existing[0].showOnPricingPage,
          showOnRegistration: body.showOnRegistration !== undefined ? Boolean(body.showOnRegistration) : existing[0].showOnRegistration,
          showOnProfessionalDashboard: body.showOnProfessionalDashboard !== undefined ? Boolean(body.showOnProfessionalDashboard) : existing[0].showOnProfessionalDashboard,
          allowMonthlyBilling: body.allowMonthlyBilling !== undefined ? Boolean(body.allowMonthlyBilling) : existing[0].allowMonthlyBilling,
          allowAnnualBilling: body.allowAnnualBilling !== undefined ? Boolean(body.allowAnnualBilling) : existing[0].allowAnnualBilling,
          allowCancel: body.allowCancel !== undefined ? Boolean(body.allowCancel) : existing[0].allowCancel,
          allowUpgrade: body.allowUpgrade !== undefined ? Boolean(body.allowUpgrade) : existing[0].allowUpgrade,
          allowDowngrade: body.allowDowngrade !== undefined ? Boolean(body.allowDowngrade) : existing[0].allowDowngrade,
          sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : existing[0].sortOrder,
          status: body.status || existing[0].status,
        })
        .where(eq(subscriptionPlans.id, id));

      // Update Items array if provided
      if (Array.isArray(body.items)) {
        // Soft-delete existing items
        await db.update(subscriptionPlanItems).set({ deletedAt: new Date() }).where(eq(subscriptionPlanItems.planId, id));

        for (let idx = 0; idx < body.items.length; idx++) {
          const item = body.items[idx];
          if (item.title && item.title.trim()) {
            await db.insert(subscriptionPlanItems).values({
              planId: id,
              title: item.title.trim(),
              description: item.description || null,
              icon: item.icon || null,
              isIncluded: item.isIncluded !== false,
              isFeatured: Boolean(item.isFeatured),
              limitValue: item.limitValue ? String(item.limitValue) : null,
              isUnlimited: Boolean(item.isUnlimited),
              displayText: item.displayText || null,
              sortOrder: Number(item.sortOrder) || idx + 1,
              status: item.status || 'active',
            });
          }
        }
      }

      // Update Features if provided
      if (Array.isArray(body.features)) {
        await db.delete(subscriptionPlanFeatures).where(eq(subscriptionPlanFeatures.planId, id));
        for (const feat of body.features) {
          if (feat.featureKey) {
            await db.insert(subscriptionPlanFeatures).values({
              planId: id,
              featureKey: feat.featureKey,
              featureName: feat.featureName || feat.featureKey,
              featureType: feat.featureType || 'boolean',
              booleanValue: Boolean(feat.booleanValue),
              numericValue: feat.numericValue !== undefined && feat.numericValue !== null ? Number(feat.numericValue) : null,
              textValue: feat.textValue || null,
              isUnlimited: Boolean(feat.isUnlimited),
            });
          }
        }
      }

      const updatedPlan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
      const updatedItems = await db.select().from(subscriptionPlanItems).where(and(eq(subscriptionPlanItems.planId, id), isNull(subscriptionPlanItems.deletedAt)));
      const updatedFeatures = await db.select().from(subscriptionPlanFeatures).where(eq(subscriptionPlanFeatures.planId, id));

      res.json({
        success: true,
        plan: {
          ...updatedPlan[0],
          items: updatedItems,
          features: updatedFeatures,
        },
        message: 'Plano atualizado com sucesso!',
      });
    } catch (err: any) {
      console.error('Error updating plan:', err);
      res.status(500).json({ success: false, error: err?.message || 'Erro ao atualizar plano' });
    }
  });

  // PATCH /api/admin/plans/:id/status (Admin)
  app.patch('/api/admin/plans/:id/status', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Status inválido. Use active ou inactive.' });
      }

      await db.update(subscriptionPlans).set({ status }).where(eq(subscriptionPlans.id, id));
      const updated = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
      res.json({ success: true, plan: updated[0], message: `Plano ${status === 'active' ? 'ativado' : 'desativado'} com sucesso!` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // PATCH /api/admin/plans/:id/recommended (Admin)
  app.patch('/api/admin/plans/:id/recommended', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const targetPlan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
      if (targetPlan.length === 0) return res.status(404).json({ success: false, error: 'Plano não encontrado' });

      const newVal = !targetPlan[0].isRecommended;
      if (newVal) {
        await db.update(subscriptionPlans).set({ isRecommended: false });
      }

      await db.update(subscriptionPlans).set({ isRecommended: newVal }).where(eq(subscriptionPlans.id, id));
      res.json({ success: true, isRecommended: newVal, message: newVal ? 'Plano definido como mais recomendado!' : 'Recomendado removido' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // PATCH /api/admin/plans/reorder (Admin)
  app.patch('/api/admin/plans/reorder', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { items } = req.body;
      if (Array.isArray(items)) {
        for (const item of items) {
          await db.update(subscriptionPlans).set({ sortOrder: Number(item.sortOrder) || 0 }).where(eq(subscriptionPlans.id, Number(item.id)));
        }
      }
      res.json({ success: true, message: 'Ordem dos planos atualizada com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/admin/plans/:id/duplicate (Admin)
  app.post('/api/admin/plans/:id/duplicate', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const source = await db.select().from(subscriptionPlans).where(and(eq(subscriptionPlans.id, id), isNull(subscriptionPlans.deletedAt)));
      if (source.length === 0) return res.status(404).json({ success: false, error: 'Plano de origem não encontrado' });

      const src = source[0];
      const newName = `${src.name} (Cópia)`;
      const newSlug = `${src.slug}-copia-${Date.now().toString().slice(-4)}`;
      const newCode = src.internalCode ? `${src.internalCode}_COPY_${Date.now().toString().slice(-4)}` : null;

      const [insertRes] = await db.insert(subscriptionPlans).values({
        name: newName,
        internalName: src.internalName ? `${src.internalName} (Cópia)` : null,
        slug: newSlug,
        internalCode: newCode,
        shortDescription: src.shortDescription,
        description: src.description,
        currency: src.currency,
        isFree: src.isFree,
        monthlyPrice: src.monthlyPrice,
        annualPrice: src.annualPrice,
        annualMonthlyEquivalent: src.annualMonthlyEquivalent,
        annualSavingsAmount: src.annualSavingsAmount,
        annualDiscountPercentage: src.annualDiscountPercentage,
        setupFee: src.setupFee,
        mainColor: src.mainColor,
        textColor: src.textColor,
        buttonColor: src.buttonColor,
        icon: src.icon,
        badgeText: src.badgeText,
        buttonText: src.buttonText,
        buttonUrl: src.buttonUrl,
        buttonTarget: src.buttonTarget,
        textAbovePrice: src.textAbovePrice,
        textBelowPrice: src.textBelowPrice,
        isRecommended: false,
        isPremium: src.isPremium,
        isFeatured: src.isFeatured,
        showOnHome: src.showOnHome,
        showOnPricingPage: src.showOnPricingPage,
        showOnRegistration: src.showOnRegistration,
        showOnProfessionalDashboard: src.showOnProfessionalDashboard,
        sortOrder: src.sortOrder + 1,
        status: 'inactive',
      });

      const newId = (insertRes as any).insertId;

      // Duplicate items
      const srcItems = await db.select().from(subscriptionPlanItems).where(and(eq(subscriptionPlanItems.planId, id), isNull(subscriptionPlanItems.deletedAt)));
      for (const item of srcItems) {
        await db.insert(subscriptionPlanItems).values({
          planId: newId,
          title: item.title,
          description: item.description,
          icon: item.icon,
          isIncluded: item.isIncluded,
          isFeatured: item.isFeatured,
          limitValue: item.limitValue,
          isUnlimited: item.isUnlimited,
          displayText: item.displayText,
          sortOrder: item.sortOrder,
          status: item.status,
        });
      }

      // Duplicate features
      const srcFeatures = await db.select().from(subscriptionPlanFeatures).where(eq(subscriptionPlanFeatures.planId, id));
      for (const feat of srcFeatures) {
        await db.insert(subscriptionPlanFeatures).values({
          planId: newId,
          featureKey: feat.featureKey,
          featureName: feat.featureName,
          featureType: feat.featureType,
          booleanValue: feat.booleanValue,
          numericValue: feat.numericValue,
          textValue: feat.textValue,
          isUnlimited: feat.isUnlimited,
        });
      }

      res.status(201).json({ success: true, message: `Plano duplicado com sucesso como '${newName}'!` });
    } catch (err: any) {
      console.error('Error duplicating plan:', err);
      res.status(500).json({ success: false, error: err?.message || 'Erro ao duplicar plano' });
    }
  });

  // DELETE /api/admin/plans/:id (Admin)
  app.delete('/api/admin/plans/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const plan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
      if (plan.length === 0) return res.status(404).json({ success: false, error: 'Plano não encontrado' });

      // Check linked subscriptions
      const linkedSubs = await db
        .select()
        .from(subscriptions)
        .where(and(eq(subscriptions.planId, id), eq(subscriptions.status, 'active')));

      if (linkedSubs.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Este plano possui assinaturas vinculadas e não pode ser excluído. Você pode desativá-lo para impedir novas assinaturas.',
        });
      }

      // Soft delete plan
      await db.update(subscriptionPlans).set({ deletedAt: new Date(), status: 'inactive' }).where(eq(subscriptionPlans.id, id));
      // Soft delete items
      await db.update(subscriptionPlanItems).set({ deletedAt: new Date() }).where(eq(subscriptionPlanItems.planId, id));

      res.json({ success: true, message: 'Plano excluído com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Sub-items subroutes
  app.post('/api/admin/plans/:id/items', requireAuth, requireAdmin, async (req, res) => {
    try {
      const planId = Number(req.params.id);
      const { title, description, icon, isIncluded, isFeatured, limitValue, isUnlimited, displayText, sortOrder } = req.body;
      if (!title || !title.trim()) return res.status(400).json({ success: false, error: 'Título do item é obrigatório' });

      const [insertRes] = await db.insert(subscriptionPlanItems).values({
        planId,
        title: title.trim(),
        description: description || null,
        icon: icon || null,
        isIncluded: isIncluded !== false,
        isFeatured: Boolean(isFeatured),
        limitValue: limitValue ? String(limitValue) : null,
        isUnlimited: Boolean(isUnlimited),
        displayText: displayText || null,
        sortOrder: Number(sortOrder) || 1,
        status: 'active',
      });

      const newId = (insertRes as any).insertId;
      const created = await db.select().from(subscriptionPlanItems).where(eq(subscriptionPlanItems.id, newId));
      res.status(201).json({ success: true, item: created[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.delete('/api/admin/plans/:id/items/:itemId', requireAuth, requireAdmin, async (req, res) => {
    try {
      const itemId = Number(req.params.itemId);
      await db.update(subscriptionPlanItems).set({ deletedAt: new Date() }).where(eq(subscriptionPlanItems.id, itemId));
      res.json({ success: true, message: 'Item removido com sucesso' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // --- PHOTOGRAPHER SUBSCRIPTIONS APIS ---
  // ==========================================

  // GET /api/photographer/subscription (Active Plan & Permissions Resolution)
  app.get('/api/photographer/subscription', optionalAuth, async (req: AuthRequest, res) => {
    try {
      let photographerId: number | undefined = req.user?.photographerId ? Number(req.user.photographerId) : undefined;

      if (!photographerId && req.query.photographerId) {
        photographerId = Number(req.query.photographerId);
      }

      if (!photographerId && req.user?.uid) {
        const p = await db.select().from(photographers).where(eq(photographers.userUid, req.user.uid));
        if (p.length > 0) photographerId = Number(p[0].id);
      }

      if (!photographerId) {
        const defaultFree = await SubscriptionService.getDefaultFreePlan();
        return res.json({
          success: true,
          effectivePlan: {
            plan: defaultFree,
            subscription: null,
            permissions: {
              gallery_photos_limit: 10,
              service_cities_limit: 1,
              categories_limit: 1,
              monthly_leads_limit: 5,
              verified_badge: false,
              premium_badge: false,
              whatsapp_direct: false,
              search_priority: false,
              crm_access: true,
              fixed_home_position: false,
              real_weddings_publication: false,
              vip_support: false,
              click_reports: false,
            },
            isFree: true,
            effectiveStatus: 'ACTIVE',
          },
        });
      }

      const effectivePlan = await SubscriptionService.getEffectivePlan(photographerId);

      const history = await db
        .select()
        .from(subscriptionHistory)
        .where(eq(subscriptionHistory.photographerId, photographerId))
        .orderBy(desc(subscriptionHistory.id))
        .limit(20);

      const payments = await db
        .select()
        .from(subscriptionPayments)
        .where(eq(subscriptionPayments.photographerId, photographerId))
        .orderBy(desc(subscriptionPayments.id))
        .limit(20);

      res.json({
        success: true,
        effectivePlan,
        history,
        payments,
      });
    } catch (err: any) {
      console.error('Error fetching photographer subscription:', err);
      res.status(500).json({ success: false, error: err?.message || 'Erro ao consultar assinatura' });
    }
  });

  // POST /api/photographer/subscription/simulate-payment
  app.post('/api/photographer/subscription/simulate-payment', optionalAuth, async (req: AuthRequest, res) => {
    try {
      // Security check: Block simulator in production environment
      if (process.env.NODE_ENV === 'production' && process.env.ENABLE_SIMULATOR !== 'true') {
        return res.status(403).json({
          success: false,
          error: 'Acesso Proibido. O simulador de pagamento está desativado em ambiente de produção.',
        });
      }

      const {
        planId,
        billingCycle = 'MONTHLY',
        simulationOutcome = 'APPROVED',
        paymentMethod,
        installments,
        externalPaymentId,
        simulationEventId,
      } = req.body;

      let photographerId: number | undefined = req.body.photographerId
        ? Number(req.body.photographerId)
        : (req.user?.photographerId ? Number(req.user.photographerId) : undefined);

      if (!photographerId && req.user?.uid) {
        const p = await db.select().from(photographers).where(eq(photographers.userUid, req.user.uid));
        if (p.length > 0) photographerId = Number(p[0].id);
      }

      if (!photographerId) {
        const allP = await db.select().from(photographers).limit(1);
        if (allP.length > 0) photographerId = Number(allP[0].id);
        else return res.status(400).json({ success: false, error: 'Nenhum fotógrafo encontrado para assinar.' });
      }

      const result = await SubscriptionService.simulatePayment({
        photographerId,
        planId: Number(planId),
        billingCycle,
        simulationOutcome,
        paymentMethod,
        installments: Number(installments) || 1,
        externalPaymentId,
        simulationEventId,
        adminId: req.user?.role === 'ADMIN' ? String(req.user.id) : undefined,
      });

      res.json(result);
    } catch (err: any) {
      console.error('Error simulating payment:', err);
      res.status(500).json({ success: false, error: err?.message || 'Erro na simulação do pagamento' });
    }
  });

  // POST /api/photographer/subscription/cancel
  app.post('/api/photographer/subscription/cancel', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { reason } = req.body;
      let photographerId = req.body.photographerId || req.user?.photographerId;

      if (!photographerId && req.user?.uid) {
        const p = await db.select().from(photographers).where(eq(photographers.userUid, req.user.uid));
        if (p.length > 0) photographerId = p[0].id;
      }

      if (!photographerId) return res.status(400).json({ success: false, error: 'Fotógrafo não identificado.' });

      const result = await SubscriptionService.requestCancellation(photographerId, reason);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/photographer/subscription/reactivate-cancellation
  app.post('/api/photographer/subscription/reactivate-cancellation', optionalAuth, async (req: AuthRequest, res) => {
    try {
      let photographerId = req.body.photographerId || req.user?.photographerId;

      if (!photographerId && req.user?.uid) {
        const p = await db.select().from(photographers).where(eq(photographers.userUid, req.user.uid));
        if (p.length > 0) photographerId = p[0].id;
      }

      if (!photographerId) return res.status(400).json({ success: false, error: 'Fotógrafo não identificado.' });

      const result = await SubscriptionService.reactivateCancellation(photographerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // --- ADMIN SUBSCRIPTIONS MANAGEMENT APIS ---
  // ==========================================

  // GET /api/admin/subscriptions (List & Comprehensive Financial Metrics)
  app.get('/api/admin/subscriptions', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { q, status, planId, billingCycle, expiringInDays, page = 1, limit = 50 } = req.query;

      await SubscriptionService.checkAndExpireSubscriptions();
      const metrics = await SubscriptionService.getAdminSubscriptionMetrics();

      let allSubs = await db.select().from(photographerSubscriptions).orderBy(desc(photographerSubscriptions.id));
      const now = new Date();

      const populatedSubs = await Promise.all(
        allSubs.map(async (sub) => {
          const photo = await db.select().from(photographers).where(eq(photographers.id, sub.photographerId));
          const plan = sub.planId ? await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, sub.planId)) : [];
          return {
            ...sub,
            photographer: photo[0] || null,
            plan: plan[0] || null,
          };
        })
      );

      let filtered = populatedSubs;

      if (q && typeof q === 'string' && q.trim()) {
        const queryClean = q.toLowerCase().trim();
        filtered = filtered.filter(
          (s) =>
            s.photographer?.name?.toLowerCase().includes(queryClean) ||
            s.photographer?.studioName?.toLowerCase().includes(queryClean) ||
            s.photographer?.email?.toLowerCase().includes(queryClean) ||
            s.plan?.name?.toLowerCase().includes(queryClean)
        );
      }

      if (status && status !== 'all') {
        filtered = filtered.filter((s) => s.status === status);
      }

      if (planId && planId !== 'all') {
        filtered = filtered.filter((s) => s.planId === Number(planId));
      }

      if (billingCycle && billingCycle !== 'all') {
        filtered = filtered.filter((s) => s.billingCycle === billingCycle);
      }

      if (expiringInDays) {
        const days = Number(expiringInDays);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);

        filtered = filtered.filter((s) => {
          if (!s.currentPeriodEnd) return false;
          const pEnd = new Date(s.currentPeriodEnd);
          return pEnd >= now && pEnd <= targetDate;
        });
      }

      const p = Number(page) || 1;
      const l = Number(limit) || 50;
      const total = filtered.length;
      const paginated = filtered.slice((p - 1) * l, p * l);

      res.json({
        success: true,
        subscriptions: paginated,
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
        metrics,
      });
    } catch (err: any) {
      console.error('Error fetching admin subscriptions:', err);
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/admin/subscriptions/manual (Manual Activation & Courtesy)
  app.post('/api/admin/subscriptions/manual', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { photographerId, planId, billingCycle = 'MONTHLY', startsAt, endsAt, amount, notes, isComplimentary = false } = req.body;

      if (!photographerId || !planId) {
        return res.status(400).json({ success: false, error: 'Fotógrafo e Plano são obrigatórios.' });
      }

      const result = await SubscriptionService.adminManualActivation({
        photographerId: Number(photographerId),
        planId: Number(planId),
        billingCycle,
        startsAt,
        endsAt,
        amount: Number(amount) || 0,
        notes,
        isComplimentary: Boolean(isComplimentary),
        adminId: String(req.user!.id),
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/admin/subscriptions/:id/suspend
  app.post('/api/admin/subscriptions/:id/suspend', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { reason } = req.body;
      const result = await SubscriptionService.adminSuspendSubscription(id, reason || 'Suspenso pelo admin', String(req.user!.id));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/admin/subscriptions/:id/reactivate
  app.post('/api/admin/subscriptions/:id/reactivate', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { compensateDays = true, reason } = req.body;
      const result = await SubscriptionService.adminReactivateSubscription(id, Boolean(compensateDays), reason, String(req.user!.id));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/admin/subscriptions/:id/cancel
  app.post('/api/admin/subscriptions/:id/cancel', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { cancelImmediately = true, reason } = req.body;
      const result = await SubscriptionService.adminCancelSubscription(id, Boolean(cancelImmediately), reason, String(req.user!.id));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/admin/subscriptions/:id/chargeback
  app.post('/api/admin/subscriptions/:id/chargeback', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { paymentId, reason } = req.body;
      const result = await SubscriptionService.adminHandleChargeback(id, paymentId ? Number(paymentId) : undefined, reason, String(req.user!.id));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/admin/subscriptions/refund
  app.post('/api/admin/subscriptions/refund', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { photographerId, planId, amount, paymentId, isPartial = false, cancelSub = true } = req.body;
      const result = await SubscriptionService.adminRefundPayment({
        photographerId: Number(photographerId),
        planId: planId ? Number(planId) : undefined,
        amount: Number(amount) || 0,
        paymentId: paymentId ? Number(paymentId) : undefined,
        isPartial: Boolean(isPartial),
        cancelSub: Boolean(cancelSub),
        adminId: String(req.user!.id),
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // --- IBGE IMPORT FUNCTION FOR ALL BRAZIL ---
  // ==========================================
  app.post('/api/admin/import-ibge-locations', requireAuth, requireAdmin, async (req, res) => {
    try {
      await seedDatabase();
      const stateCount = (await db.select().from(states)).length;
      const cityCount = (await db.select().from(cities)).length;
      res.json({ success: true, report: { states: stateCount, cities: cityCount }, message: 'Localidades iniciais sincronizadas no MySQL.' });
    } catch (err: any) {
      console.error('IBGE import error:', err);
      res.status(500).json({ success: false, error: err?.message || 'Erro ao executar importação IBGE' });
    }
  });

  // --- RECENT WEDDINGS (Casamentos Reais) API ---
  app.get('/api/recent-weddings', async (req, res) => {
    try {
      const list = await db.select().from(recentWeddings).orderBy(desc(recentWeddings.createdAt));
      res.json({ success: true, weddings: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.get('/api/recent-weddings/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const list = await db.select().from(recentWeddings).where(eq(recentWeddings.slug, slug));
      if (!list.length) return res.status(404).json({ success: false, error: 'Casamento não encontrado' });
      res.json({ success: true, wedding: list[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // --- BLOG ARTICLES API ---
  app.get('/api/blog', async (req, res) => {
    try {
      const list = await db.select().from(blogArticles).orderBy(desc(blogArticles.createdAt));
      res.json({ success: true, articles: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.get('/api/blog/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const list = await db.select().from(blogArticles).where(eq(blogArticles.slug, slug));
      if (!list.length) return res.status(404).json({ success: false, error: 'Artigo não encontrado' });
      res.json({ success: true, article: list[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // --- SUBSCRIPTION PLANS API ---
  app.get('/api/plans', async (req, res) => {
    try {
      const plans = await db.select().from(subscriptionPlans).orderBy(asc(subscriptionPlans.sortOrder));
      res.json({ success: true, plans });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // --- FAVORITES API ---
  app.get('/api/favorites', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userUid = req.user!.uid;

      const favs = await db.select().from(favorites).where(eq(favorites.userUid, userUid));
      const photoIds = favs.map((f) => f.photographerId).filter(Boolean) as number[];

      const favPhotographers = photoIds.length
        ? await db.select().from(photographers).where(inArray(photographers.id, photoIds))
        : [];
      res.json({ success: true, favorites: favPhotographers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.post('/api/favorites', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userUid = req.user!.uid;
      const { photographerId } = req.body;

      const existing = await db.select().from(favorites).where(and(
        eq(favorites.userUid, userUid),
        eq(favorites.photographerId, Number(photographerId)),
      )).limit(1);
      if (!existing.length) await db.insert(favorites).values({ userUid, photographerId: Number(photographerId) });

      res.status(201).json({ success: true, message: 'Fotógrafo adicionado aos favoritos!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.delete('/api/favorites/:photographerId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userUid = req.user!.uid;
      const photographerId = Number(req.params.photographerId);

      await db.delete(favorites).where(and(eq(favorites.userUid, userUid), eq(favorites.photographerId, photographerId)));

      res.json({ success: true, message: 'Removido dos favoritos' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // --- CHECKLIST API ---
  app.get('/api/checklists', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userUid = req.user!.uid;

      const items = await db.select().from(userChecklists).where(eq(userChecklists.userUid, userUid));
      res.json({ success: true, items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.post('/api/checklists', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userUid = req.user!.uid;
      const { task, timeframe, category } = req.body;

      const [insertRes] = await db.insert(userChecklists).values({
          userUid,
          task,
          timeframe: timeframe || 'A qualquer momento',
          category: category || 'Fotografia',
          completed: false,
        });

        const newId = (insertRes as any).insertId;
        const fetched = await db
          .select()
          .from(userChecklists)
          .where(eq(userChecklists.id, newId));
      return res.status(201).json({ success: true, item: fetched[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.patch('/api/checklists/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { completed } = req.body;

      await db.update(userChecklists).set({ completed }).where(eq(userChecklists.id, id));
      const fetched = await db.select().from(userChecklists).where(eq(userChecklists.id, id));
      if (!fetched.length) return res.status(404).json({ success: false, error: 'Item não encontrado.' });
      res.json({ success: true, item: fetched[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // --- CLICK LOGS API ---
  app.post('/api/click-logs', async (req, res) => {
    try {
      const { photographerId, clickType } = req.body;
      const pId = Number(photographerId);

      if (pId) {
        await db.insert(clickLogs).values({
            photographerId: pId,
            clickType: clickType || 'whatsapp',
          });

          if (clickType === 'whatsapp') {
            await db
              .update(photographers)
              .set({ whatsappClicks: sql`${photographers.whatsappClicks} + 1` })
              .where(eq(photographers.id, pId));
          }
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- NOIVABOT GEMINI AI MATCH ROUTE ---
  app.post('/api/ai-match', async (req, res) => {
    try {
      const { userPrompt, city, style, budget, guestCount } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `Você é a "NoivaBot AI", a consultora inteligente especialista em fotografia de casamento do portal "Guia Fotógrafo Casamento" no Brasil.
Suas respostas devem ser extremamente gentis, elegantes, entusiasmadas e práticas para os noivos.
Dê dicas valiosas de estilos (Fine Art, Documental, Boho, Clássico, Editorial), orçamento médio para a cidade do casal e sugira quais serviços incluir (Pré Wedding, Drone, Vídeo, Álbum).
Formate a resposta em tópicos claros com markdown.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\nDados do Casamento:\n- Cidade: ${
                    city || 'Não especificada'
                  }\n- Estilo: ${style || 'Aberto'}\n- Orçamento estimado: ${
                    budget ? 'R$ ' + budget : 'A definir'
                  }\n- Convidados: ${guestCount || 'Não informado'}\n- Detalhes adicionais do casal: ${
                    userPrompt || 'Busco o fotógrafo ideal'
                  }`,
                },
              ],
            },
          ],
        });

        const textOutput = response.text || 'Analisando perfil do casamento...';
        return res.json({ success: true, advice: textOutput });
      } else {
        return res.json({
          success: true,
          advice: `✨ **Recomendações Personalizadas da NoivaBot:**

1. **Estilo Ideal:** Para o seu estilo **${
            style || 'Fine Art / Boho'
          }**, recomendamos profissionais que dominam a iluminação natural e o fotojornalismo espontâneo.
2. **Orçamento Estimado:** Para um casamento em **${
            city || 'sua região'
          }**, a média ideal para cobertura com foto + álbum e pré-wedding varia entre R$ 3.500 e R$ 6.500.
3. **Dica de Ouro:** Solicite orçamento para ao menos 3 fotógrafos e verifique o portfólio completo do making of até a festa!`,
        });
      }
    } catch (error: any) {
      console.error('Error in AI match route:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro na consultoria AI',
        advice:
          'Tivemos uma oscilação momentânea no assistente AI, mas você pode usar nossos filtros de busca por cidade e preço!',
      });
    }
  });

  // --- ADMIN METRICS API (Protected with requireAdmin) ---
  app.get('/api/admin/metrics', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const allUsers = await db.select().from(users);
      const allPhotographers = await db.select().from(photographers);
      const allLeads = await db.select().from(leads);
      const allReviews = await db.select().from(reviews);
      const totalUsers = allUsers.length;
      const totalPhotographers = allPhotographers.length;
      const approvedPhotographers = allPhotographers.filter((p) => p.status === 'approved').length;
      const pendingPhotographers = allPhotographers.filter((p) => p.status === 'pending').length;
      const totalLeads = allLeads.length;
      const totalReviews = allReviews.length;
      const premiumPhotographers = allPhotographers.filter((p) => p.plan === 'Premium').length;

      res.json({
        success: true,
        metrics: {
          totalUsers,
          totalPhotographers,
          approvedPhotographers,
          pendingPhotographers,
          totalLeads,
          totalReviews,
          premiumPhotographers,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Admin Approve / Reject Photographer (Protected with requireAdmin)
  app.patch(
    '/api/admin/photographers/:id/status',
    requireAuth,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const id = Number(req.params.id);
        const { status } = req.body;

        await db.update(photographers).set({ status }).where(eq(photographers.id, id));
        const fetched = await db.select().from(photographers).where(eq(photographers.id, id));
        if (!fetched.length) return res.status(404).json({ success: false, error: 'Fotógrafo não encontrado.' });
        return res.json({ success: true, photographer: fetched[0] });
      } catch (err: any) {
        res.status(500).json({ success: false, error: err?.message });
      }
    }
  );

  // --- VITE DEV / PRODUCTION STATIC MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

}

startServer().catch((error) => {
  console.error('Falha fatal durante a inicialização:', error);
  process.exit(1);
});
