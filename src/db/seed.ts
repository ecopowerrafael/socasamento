import { db } from './index.ts';
import {
  users,
  states,
  cities,
  photographers,
  photographerMedia,
  photographerPackages,
  reviews,
  recentWeddings,
  blogArticles,
  subscriptionPlans,
  subscriptionPlanItems,
  subscriptionPlanFeatures,
  categories,
  photographerCategories,
  userChecklists,
  leads,
  coupleProfiles,
  weddingTasks,
  weddingEvents,
  weddingBudgets,
  weddingBudgetCategories,
  weddingExpenses,
  weddingGuests,
  weddingGifts,
  inspirationFavorites,
  inspirations,
  photoLocations,
  weddingTimelines,
  weddingTimelineItems,
  achievements,
  userAchievements,
  weddingWebsites,
} from './schema.ts';
import { BRAZIL_STATES, MOCK_PHOTOGRAPHERS, RECENT_WEDDINGS, BLOG_ARTICLES, INITIAL_CHECKLIST } from '../data/mockData.ts';
import {
  GAMIFICATION_BADGES,
  INITIAL_BRIDE_EXPENSES,
  INITIAL_BRIDE_GIFTS,
  INITIAL_BRIDE_GUESTS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_INSPIRATIONS,
  INITIAL_TIMELINE_ITEMS,
  PHOTO_LOCATIONS,
} from '../data/brideData.ts';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('Starting MySQL Database Seed...');

  try {
    // 1. Seed Super Admin & Admin Users.
    // Store only one-way hashes in source control and also repair accounts
    // created by older seeds with outdated credentials.
    const superAdminPassHash = '$2b$10$cpZvYSr1j50vPl8mCLZ50.UvjjNomTaFcy9lnV/FsV/r/fhnfTt9y';
    const adminPassHash = '$2b$10$pZF2e902d8tOOWLvs7rmOeCk4SvnuGCXETuf6ibVMD1YHW35ZZA5u';

    const superAdminExist = await db.select().from(users).where(eq(users.uid, 'super-admin-uid-rafael'));
    if (superAdminExist.length === 0) {
      await db.insert(users).values({
        uid: 'super-admin-uid-rafael',
        name: 'Rafael (Super Admin)',
        email: 'rafael@guiafotografocasamento.com.br',
        phone: '(11) 99999-0000',
        passwordHash: superAdminPassHash,
        role: 'super_admin',
        status: 'active',
      });
    } else {
      await db.update(users).set({
        email: 'rafael@guiafotografocasamento.com.br',
        passwordHash: superAdminPassHash,
        role: 'super_admin',
        status: 'active',
      }).where(eq(users.id, superAdminExist[0].id));
    }

    const adminExist = await db.select().from(users).where(eq(users.uid, 'admin-uid-guiafotografo'));
    if (adminExist.length === 0) {
      await db.insert(users).values({
        uid: 'admin-uid-guiafotografo',
        name: 'Guia Fotógrafo (Admin)',
        email: 'admin@guiafotografocasamento.com.br',
        phone: '(11) 98888-1111',
        passwordHash: adminPassHash,
        role: 'admin',
        status: 'active',
      });
    } else {
      await db.update(users).set({
        email: 'admin@guiafotografocasamento.com.br',
        passwordHash: adminPassHash,
        role: 'admin',
        status: 'active',
      }).where(eq(users.id, adminExist[0].id));
    }

    const photographerUserExist = await db.select().from(users).where(eq(users.uid, 'photographer-demo-uid-perez'));
    if (photographerUserExist.length === 0) {
      await db.insert(users).values({
        uid: 'photographer-demo-uid-perez',
        name: 'Eduardo Perez',
        email: 'contato@perezfotografia.com.br',
        phone: '(19) 99876-5432',
        passwordHash: await bcrypt.hash('perez2026', 10),
        role: 'photographer',
        status: 'active',
      });
    }

    let brideUser = (await db.select().from(users).where(eq(users.uid, 'client-demo-uid-camila')).limit(1))[0];
    if (!brideUser) {
      const [createdBride] = await db.insert(users).values({
        uid: 'client-demo-uid-camila',
        name: 'Camila Silva',
        email: 'camila.fernando@email.com',
        phone: '(19) 99876-5432',
        passwordHash: await bcrypt.hash('camila2026', 10),
        role: 'bride',
        status: 'active',
      }).$returningId();
      brideUser = (await db.select().from(users).where(eq(users.id, createdBride.id)).limit(1))[0];
    }

    console.log('✓ Super Admin and Admin Users seeded successfully');

    // 1.5. Seed Categories
    const initialCategories = [
      { name: 'Fotógrafos', slug: 'fotografos', icon: 'Camera', iconColor: '#C88E9B', showOnHome: true, showOnSearch: true, sortOrder: 1, shortDescription: 'Fotógrafos especialistas em casamentos' },
      { name: 'Foto e Filme', slug: 'foto-e-filme', icon: 'Video', iconColor: '#C7A86A', showOnHome: true, showOnSearch: true, sortOrder: 2, shortDescription: 'Cobertura completa de foto e filmagem' },
      { name: 'Drone', slug: 'drone', icon: 'Aperture', iconColor: '#5A4035', showOnHome: true, showOnSearch: true, sortOrder: 3, shortDescription: 'Imagens e filmagens aéreas de alta resolução' },
      { name: 'Pré-wedding', slug: 'pre-wedding', icon: 'Heart', iconColor: '#C88E9B', showOnHome: true, showOnSearch: true, sortOrder: 4, shortDescription: 'Ensaios fotográficos de casais antes do grande dia' },
      { name: 'Pós-wedding', slug: 'pos-wedding', icon: 'Sparkles', iconColor: '#5A4035', showOnHome: false, showOnSearch: true, sortOrder: 5, shortDescription: 'Ensaios românticos pós-casamento e trash the dress' },
      { name: 'Mini Wedding', slug: 'mini-wedding', icon: 'Users', iconColor: '#C7A86A', showOnHome: true, showOnSearch: true, sortOrder: 6, shortDescription: 'Fotografia intimista para casamentos pequenos' },
      { name: 'Destination Wedding', slug: 'destination-wedding', icon: 'Globe', iconColor: '#C88E9B', showOnHome: true, showOnSearch: true, sortOrder: 7, shortDescription: 'Fotógrafos disponíveis para viajar pelo Brasil e exterior' },
      { name: 'Casamento Civil', slug: 'casamento-civil', icon: 'FileText', iconColor: '#5A4035', showOnHome: false, showOnSearch: true, sortOrder: 8, shortDescription: 'Cobertura fotográfica de cartório e recepções íntimas' },
      { name: 'Casamento Religioso', slug: 'casamento-religioso', icon: 'Church', iconColor: '#C7A86A', showOnHome: false, showOnSearch: true, sortOrder: 9, shortDescription: 'Fotografia de cerimônias em igrejas e templos' },
    ];

    for (const cat of initialCategories) {
      const existingCat = await db.select().from(categories).where(eq(categories.slug, cat.slug));
      if (existingCat.length === 0) {
        await db.insert(categories).values({
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          iconColor: cat.iconColor,
          shortDescription: cat.shortDescription,
          seoTitle: `${cat.name} para Casamento | Guia Fotógrafo`,
          seoDescription: `Encontre e contrate os melhores serviços de ${cat.name} para seu casamento. Orçamentos grátis!`,
          showOnHome: cat.showOnHome,
          showOnSearch: cat.showOnSearch,
          sortOrder: cat.sortOrder,
          status: 'active',
        });
      }
    }
    console.log('✓ Initial Categories seeded');

    // 2. Seed States & Cities
    const regionMap: Record<string, string> = {
      SP: 'Sudeste', RJ: 'Sudeste', MG: 'Sudeste', ES: 'Sudeste',
      PR: 'Sul', SC: 'Sul', RS: 'Sul',
      BA: 'Nordeste', PE: 'Nordeste', CE: 'Nordeste', RN: 'Nordeste', PB: 'Nordeste', AL: 'Nordeste', SE: 'Nordeste', MA: 'Nordeste', PI: 'Nordeste',
      GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste', DF: 'Centro-Oeste',
      AM: 'Norte', PA: 'Norte', AC: 'Norte', RO: 'Norte', RR: 'Norte', AP: 'Norte', TO: 'Norte',
    };

    for (let index = 0; index < BRAZIL_STATES.length; index++) {
      const stateData = BRAZIL_STATES[index];
      const stateSlug = stateData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
      let stateId: number;

      const existingState = await db.select().from(states).where(eq(states.uf, stateData.uf));
      if (existingState.length === 0) {
        const [stRes] = await db.insert(states).values({
          uf: stateData.uf,
          name: stateData.name,
          slug: stateSlug,
          region: regionMap[stateData.uf] || 'Sudeste',
          photographersCount: 0,
          showInNavigation: true,
          sortOrder: index + 1,
          status: 'active',
          seoTitle: `Fotógrafos de Casamento em ${stateData.name} - ${stateData.uf}`,
          seoDescription: `Guia completo dos melhores fotógrafos de casamento em ${stateData.name}. Compare preços, portfólios e peça orçamentos grátis.`,
        });
        stateId = (stRes as any).insertId;
      } else {
        stateId = existingState[0].id;
        if (existingState[0].photographersCount) {
          await db.update(states).set({ photographersCount: 0 }).where(eq(states.id, stateId));
        }
      }

      // Seed Top Cities
      for (let cIdx = 0; cIdx < stateData.topCities.length; cIdx++) {
        const cityName = stateData.topCities[cIdx];
        const citySlug = `fotografo-casamento-${cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}`;
        const existingCity = await db.select().from(cities).where(eq(cities.slug, citySlug));
        if (existingCity.length === 0) {
          await db.insert(cities).values({
            stateId,
            stateUf: stateData.uf,
            name: cityName,
            slug: citySlug,
            introductoryText: `Encontre os melhores fotógrafos de casamento em ${cityName} - ${stateData.uf}. Compare preços, portfólios, avaliações e peça orçamentos.`,
            heroText: `Fotógrafos de Casamento em ${cityName}`,
            seoTitle: `Fotógrafos de Casamento em ${cityName} - ${stateData.uf} | Orçamentos Grátis`,
            seoDescription: `Lista completa dos melhores fotógrafos de casamento em ${cityName}, ${stateData.uf}. Orçamentos grátis e sem compromisso.`,
            showInNavigation: true,
            featured: cIdx === 0,
            sortOrder: cIdx + 1,
            status: 'active',
          });
        }
      }
    }
    console.log('✓ States & Cities seeded');

    // 3. Seed Subscription Plans
    const plansData = [
      {
        name: 'Gratuito',
        internalName: 'gratuito',
        slug: 'gratuito',
        internalCode: 'PLAN_GRATUITO',
        planType: 'FREE',
        isDefaultFreePlan: true,
        isFree: true,
        monthlyPrice: '0.00',
        annualPrice: '0.00',
        sortOrder: 1,
        description: 'Perfil básico para fotógrafos iniciantes no portal.',
      },
      {
        name: 'Destaque',
        internalName: 'destaque',
        slug: 'destaque',
        internalCode: 'PLAN_DESTAQUE',
        monthlyPrice: '99.00',
        annualPrice: '990.00',
        isFeatured: true,
        isRecommended: true,
        sortOrder: 2,
        description: 'Ideal para ter mais destaque e receber mais orçamentos.',
      },
      {
        name: 'Premium',
        internalName: 'premium',
        slug: 'premium',
        internalCode: 'PLAN_PREMIUM',
        monthlyPrice: '199.00',
        annualPrice: '1990.00',
        isFeatured: true,
        isPremium: true,
        sortOrder: 3,
        description: 'Máxima visibilidade no portal, topo das buscas e banner.',
      },
    ];

    for (const plan of plansData) {
      const existingPlan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.slug, plan.slug));
      if (existingPlan.length === 0) {
        await db.insert(subscriptionPlans).values(plan);
      }
    }
    const planItems: Record<string, string[]> = {
      gratuito: ['Até 6 fotos na galeria', 'Receba solicitações de orçamento', 'Perfil na busca por cidade'],
      destaque: ['Até 20 fotos e vídeos', 'Selo Verificado e Destaque', 'Botão de WhatsApp direto', 'Posição privilegiada nas buscas'],
      premium: ['Fotos ilimitadas e vídeos HD', 'Destaque na página inicial', 'Selo Premium + Top Avaliado', 'Estatísticas detalhadas'],
    };
    for (const [slug, items] of Object.entries(planItems)) {
      const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.slug, slug)).limit(1);
      if (!plan) continue;
      const existing = await db.select().from(subscriptionPlanItems).where(eq(subscriptionPlanItems.planId, plan.id)).limit(1);
      if (!existing.length) {
        await db.insert(subscriptionPlanItems).values(items.map((title, index) => ({
          planId: plan.id,
          title,
          isIncluded: true,
          sortOrder: index + 1,
        })));
      }
    }
    console.log('✓ Subscription Plans seeded');

    // 4. Seed Photographers
    for (const photo of MOCK_PHOTOGRAPHERS) {
      const existingPhoto = await db.select().from(photographers).where(eq(photographers.slug, photo.slug));
      let pId: number;

      if (existingPhoto.length === 0) {
        const [res] = await db.insert(photographers).values({
          userUid: photo.id === 'p1' ? 'photographer-demo-uid-perez' : undefined,
          slug: photo.slug,
          name: photo.name,
          studioName: photo.studioName,
          avatar: photo.avatar,
          coverImage: photo.coverImage,
          city: photo.city,
          state: photo.state,
          neighborhood: photo.neighborhood,
          rating: photo.rating,
          reviewCount: photo.reviewCount,
          priceStartingFrom: photo.priceStartingFrom,
          priceCategory: photo.priceCategory,
          styles: photo.styles,
          deliverables: photo.deliverables,
          categories: photo.categories,
          badges: photo.badges,
          yearsExperience: photo.yearsExperience,
          weddingsCompleted: photo.weddingsCompleted,
          awardsCount: photo.awardsCount,
          description: photo.description,
          bioFull: photo.bioFull,
          phone: photo.phone,
          whatsapp: photo.whatsapp,
          instagram: photo.instagram,
          website: photo.website,
          email: photo.email,
          address: photo.address,
          faqs: photo.faqs,
          featuredInHome: photo.featuredInHome || false,
          plan: photo.plan || 'Gratuito',
          status: 'demo',
        });
        pId = (res as any).insertId;

        // Seed Gallery Media
        for (const item of photo.gallery) {
          await db.insert(photographerMedia).values({
            photographerId: pId,
            type: 'photo',
            url: item.url,
            caption: item.caption,
            category: item.category,
            featured: item.featured || false,
          });
        }

        // Seed Videos
        for (const vid of photo.videos || []) {
          await db.insert(photographerMedia).values({
            photographerId: pId,
            type: 'video',
            url: vid.embedUrl,
            caption: vid.title,
            thumbnail: vid.thumbnail,
            embedUrl: vid.embedUrl,
          });
        }

        // Seed Packages
        for (const pkg of photo.packages || []) {
          await db.insert(photographerPackages).values({
            photographerId: pId,
            name: pkg.name,
            price: pkg.price,
            popular: pkg.popular || false,
            description: pkg.description,
            features: pkg.features,
            deliverables: pkg.deliverables,
          });
        }

        // Seed Reviews
        for (const rev of photo.reviews || []) {
          await db.insert(reviews).values({
            photographerId: pId,
            coupleName: rev.coupleName,
            date: rev.date,
            weddingLocation: rev.weddingLocation,
            rating: rev.rating,
            comment: rev.comment,
            photographerReply: rev.photographerReply,
            verifiedBooking: rev.verifiedBooking,
            status: 'approved',
          });
        }
      } else if (existingPhoto[0].status !== 'demo') {
        await db.update(photographers).set({ status: 'demo' }).where(eq(photographers.id, existingPhoto[0].id));
      }
    }
    console.log('✓ Photographers, Gallery, Packages, and Reviews seeded');

    // 5. Seed Recent Weddings
    for (const rw of RECENT_WEDDINGS) {
      const existingRw = await db.select().from(recentWeddings).where(eq(recentWeddings.slug, rw.slug));
      if (existingRw.length === 0) {
        await db.insert(recentWeddings).values({
          slug: rw.slug,
          title: rw.title,
          couple: rw.couple,
          date: rw.date,
          city: rw.city,
          state: rw.state,
          venue: rw.venue,
          photographerName: rw.photographerName,
          photographerSlug: rw.photographerSlug,
          coverImage: rw.coverImage,
          gallery: rw.gallery,
          story: rw.story,
          style: rw.style,
        });
      }
    }
    console.log('✓ Recent Weddings seeded');

    // 6. Seed Blog Articles
    for (const art of BLOG_ARTICLES) {
      const existingArt = await db.select().from(blogArticles).where(eq(blogArticles.slug, art.slug));
      if (existingArt.length === 0) {
        await db.insert(blogArticles).values({
          slug: art.slug,
          title: art.title,
          excerpt: art.excerpt,
          content: art.content,
          category: art.category,
          author: art.author,
          date: art.date,
          readTime: art.readTime,
          image: art.image,
          seoKeywords: art.seoKeywords,
        });
      }
    }
    console.log('✓ Blog Articles seeded');

    // 7. Seed MySQL catalogs formerly kept as frontend mock data
    for (let index = 0; index < INITIAL_INSPIRATIONS.length; index++) {
      const item = INITIAL_INSPIRATIONS[index];
      const existing = await db.select().from(inspirations).where(eq(inspirations.id, item.id)).limit(1);
      if (!existing.length) {
        await db.insert(inspirations).values({
          id: item.id,
          title: item.title,
          category: item.category,
          imageUrl: item.imageUrl,
          likesCount: item.likesCount,
          status: 'active',
          sortOrder: index + 1,
        });
      }
    }

    for (let index = 0; index < PHOTO_LOCATIONS.length; index++) {
      const item = PHOTO_LOCATIONS[index];
      const existing = await db.select().from(photoLocations).where(eq(photoLocations.id, item.id)).limit(1);
      if (!existing.length) {
        await db.insert(photoLocations).values({
          id: item.id,
          name: item.name,
          category: item.category,
          city: item.city,
          state: item.state,
          coverImage: item.coverImage,
          idealTime: item.idealTime,
          needAuthorization: item.needAuthorization,
          feeInfo: item.feeInfo || null,
          description: item.description,
          address: item.address || null,
          status: 'active',
          sortOrder: index + 1,
        });
      }
    }

    if (!brideUser) throw new Error('Não foi possível criar o usuário de demonstração da noiva.');
    const brideId = brideUser.id;

    // 8. Seed complete bride portal examples, once, in MySQL
    if (!(await db.select().from(coupleProfiles).where(eq(coupleProfiles.userId, brideId)).limit(1)).length) {
      await db.insert(coupleProfiles).values({
        userId: brideId,
        partnerName: 'Fernando Oliveira',
        weddingDate: '2026-11-15',
        weddingType: 'Campo / Fazenda',
        estimatedGuests: 150,
        estimatedBudget: '80000.00',
        weddingStyle: 'Fine Art',
        ceremonyLocation: 'Fazenda Roseiras',
        receptionLocation: 'Lago Imperial',
        planningProgress: 68,
      });
    }

    if (!(await db.select().from(weddingTasks).where(eq(weddingTasks.userId, brideId)).limit(1)).length) {
      await db.insert(weddingTasks).values(INITIAL_CHECKLIST.map((item, index) => ({
        userId: brideId,
        title: item.task,
        category: item.category,
        recommendedMonth: item.timeframe,
        isCompleted: item.completed,
        completedAt: item.completed ? new Date() : null,
        sortOrder: index + 1,
      })));
    }

    if (!(await db.select().from(weddingEvents).where(eq(weddingEvents.userId, brideId)).limit(1)).length) {
      await db.insert(weddingEvents).values(INITIAL_CALENDAR_EVENTS.map((item) => ({
        userId: brideId,
        title: item.title,
        description: item.notes || null,
        eventType: item.type,
        location: item.location || null,
        startAt: `${item.date}T${item.time}:00`,
        allDay: false,
        reminderEnabled: item.notify,
        reminderMinutes: 1440,
        status: 'scheduled',
      })));
    }

    if (!(await db.select().from(weddingBudgets).where(eq(weddingBudgets.userId, brideId)).limit(1)).length) {
      await db.insert(weddingBudgets).values({ userId: brideId, totalBudget: '80000.00', currency: 'BRL' });
    }
    const brideBudget = (await db.select().from(weddingBudgets).where(eq(weddingBudgets.userId, brideId)).limit(1))[0];
    if (brideBudget && !(await db.select().from(weddingBudgetCategories).where(eq(weddingBudgetCategories.budgetId, brideBudget.id)).limit(1)).length) {
      const allocations = [
        ['Fotografia', 12], ['Buffet', 35], ['Vestido', 10], ['Decoração', 15],
        ['Música', 8], ['Convites', 2], ['Cerimonial', 8], ['Outros', 10],
      ] as const;
      await db.insert(weddingBudgetCategories).values(
        allocations.map(([categoryName, percentage], index) => ({
          budgetId: brideBudget.id,
          categoryName,
          percentage: String(percentage),
          plannedAmount: String(80000 * percentage / 100),
          actualAmount: '0.00',
          sortOrder: index + 1,
        }))
      );
    }

    if (!(await db.select().from(weddingExpenses).where(eq(weddingExpenses.userId, brideId)).limit(1)).length) {
      await db.insert(weddingExpenses).values(INITIAL_BRIDE_EXPENSES.map((item) => ({
        userId: brideId,
        supplierName: item.supplier,
        category: item.category,
        contractedAmount: String(item.amount),
        paidAmount: String(item.paidAmount),
        remainingAmount: String(Math.max(0, item.amount - item.paidAmount)),
        dueDate: item.dueDate,
        paymentStatus: item.paidAmount >= item.amount ? 'Pago' : 'Pendente',
      })));
    }

    if (!(await db.select().from(weddingGuests).where(eq(weddingGuests.userId, brideId)).limit(1)).length) {
      await db.insert(weddingGuests).values(INITIAL_BRIDE_GUESTS.map((item) => ({
        userId: brideId,
        name: item.name,
        phone: item.phone,
        familyGroup: item.family,
        companions: item.companionCount,
        tableName: item.tableNumber,
        confirmationStatus: item.status === 'confirmado' ? 'confirmed' : item.status === 'recusado' ? 'declined' : 'pending',
      })));
    }

    if (!(await db.select().from(weddingGifts).where(eq(weddingGifts.userId, brideId)).limit(1)).length) {
      await db.insert(weddingGifts).values(INITIAL_BRIDE_GIFTS.map((item) => ({
        userId: brideId,
        name: item.title,
        description: item.category || null,
        estimatedValue: String(item.value),
        image: item.imageUrl || null,
        isPurchased: item.purchased,
        purchasedBy: item.givenBy || null,
        purchasedAt: item.purchased ? new Date() : null,
      })));
    }

    let timeline = (await db.select().from(weddingTimelines).where(eq(weddingTimelines.userId, brideId)).limit(1))[0];
    if (!timeline) {
      const [created] = await db.insert(weddingTimelines).values({
        userId: brideId,
        title: 'Cronograma do Dia do Casamento',
        weddingDate: '2026-11-15',
      }).$returningId();
      timeline = (await db.select().from(weddingTimelines).where(eq(weddingTimelines.id, created.id)).limit(1))[0];
    }
    if (timeline && !(await db.select().from(weddingTimelineItems).where(eq(weddingTimelineItems.timelineId, timeline.id)).limit(1)).length) {
      await db.insert(weddingTimelineItems).values(INITIAL_TIMELINE_ITEMS.map((item, index) => ({
        timelineId: timeline.id,
        time: item.time,
        title: item.title,
        description: item.desc,
        sortOrder: index + 1,
      })));
    }

    if (!(await db.select().from(weddingWebsites).where(eq(weddingWebsites.userId, brideId)).limit(1)).length) {
      await db.insert(weddingWebsites).values({
        userId: brideId,
        slug: 'camila-e-fernando',
        coupleNames: 'Camila & Fernando',
        headline: 'Nosso grande dia',
        story: 'Nos conhecemos em 2021 durante uma viagem e desde então soubemos que nosso destino era caminhar juntos.',
        weddingDate: '2026-11-15',
        ceremonyLocation: 'Fazenda Roseiras e Lago Imperial',
        receptionLocation: 'Rodovia Piracicaba - Anhumas, Km 12 - Piracicaba/SP',
        theme: 'Romantic Rose',
        isPublished: true,
        rsvpEnabled: true,
      });
    }

    for (const badge of GAMIFICATION_BADGES) {
      let achievement = (await db.select().from(achievements).where(eq(achievements.slug, badge.id)).limit(1))[0];
      if (!achievement) {
        const [created] = await db.insert(achievements).values({
          name: badge.title,
          slug: badge.id,
          description: badge.description,
          icon: badge.icon,
          category: 'BRIDE_PLANNING',
        }).$returningId();
        achievement = (await db.select().from(achievements).where(eq(achievements.id, created.id)).limit(1))[0];
      }
      if (badge.unlocked && achievement) {
        const existing = await db.select().from(userAchievements)
          .where(eq(userAchievements.userId, brideId));
        if (!existing.some((item) => item.achievementId === achievement!.id)) {
          await db.insert(userAchievements).values({ userId: brideId, achievementId: achievement.id });
        }
      }
    }

    for (const item of INITIAL_INSPIRATIONS.filter((inspiration) => inspiration.favorited)) {
      const existing = await db.select().from(inspirationFavorites)
        .where(eq(inspirationFavorites.userId, brideId));
      if (!existing.some((favorite) => favorite.inspirationId === item.id)) {
        await db.insert(inspirationFavorites).values({
          userId: brideId,
          inspirationId: item.id,
          title: item.title,
          category: item.category,
          imageUrl: item.imageUrl,
        });
      }
    }

    // Legacy checklist API remains idempotently populated for existing screens.
    if (!(await db.select().from(userChecklists).where(eq(userChecklists.userUid, 'client-demo-uid-camila')).limit(1)).length) {
      await db.insert(userChecklists).values(INITIAL_CHECKLIST.map((item) => ({
        userUid: 'client-demo-uid-camila',
        task: item.task,
        timeframe: item.timeframe,
        completed: item.completed,
        category: item.category,
      })));
    }

    // Demo lead is also idempotent.
    if (!(await db.select().from(leads).where(eq(leads.userUid, 'client-demo-uid-camila')).limit(1)).length) {
      await db.insert(leads).values({
        userUid: 'client-demo-uid-camila',
        coupleName: 'Camila & Fernando',
        email: 'camila.fernando@email.com',
        phone: '(19) 99876-5432',
        whatsapp: '5519998765432',
        weddingDate: '2026-11-15',
        city: 'Piracicaba',
        state: 'SP',
        venueType: 'Campo / Fazenda',
        estimatedGuests: 150,
        budgetLimit: 7000,
        servicesNeeded: ['Foto', 'Vídeo', 'Álbum'],
        stylePreference: 'Fine Art',
        photographerIds: ['p1'],
        message: 'Olá! Gostaria de um orçamento detalhado para nosso casamento em Piracicaba.',
        status: 'Novo',
      });
    }

    // 9. Seed Commercial Subscription Plans
    const existingPlans = await db.select().from(subscriptionPlans);
    if (existingPlans.length === 0) {
      // Plan 1: Gratuito
      const [p1] = await db.insert(subscriptionPlans).values({
        name: 'Plano Gratuito',
        internalName: 'gratuito',
        slug: 'plano-gratuito',
        internalCode: 'PLAN_GRATUITO',
        planType: 'FREE',
        isDefaultFreePlan: true,
        shortDescription: 'Ideal para quem está iniciando no mercado de casamento.',
        description: 'Plano inicial para fotógrafos e estúdios cadastros no diretório.',
        currency: 'BRL',
        isFree: true,
        monthlyPrice: '0.00',
        annualPrice: '0.00',
        textBelowPrice: 'Para sempre grátis',
        badgeText: null,
        buttonText: 'Cadastrar Grátis',
        mainColor: '#5A4035',
        textColor: '#5A4035',
        buttonColor: '#FAF5F0',
        icon: 'User',
        isRecommended: false,
        isPremium: false,
        isFeatured: false,
        showOnHome: true,
        showOnPricingPage: true,
        showOnRegistration: true,
        showOnProfessionalDashboard: true,
        sortOrder: 1,
        status: 'active',
      }).$returningId();

      if (p1?.id) {
        await db.insert(subscriptionPlanItems).values([
          { planId: p1.id, title: 'Perfil básico no diretório', isIncluded: true, sortOrder: 1 },
          { planId: p1.id, title: 'Até 10 fotos na galeria', isIncluded: true, limitValue: '10', sortOrder: 2 },
          { planId: p1.id, title: 'Links para redes sociais', isIncluded: true, sortOrder: 3 },
          { planId: p1.id, title: 'Recebimento de orçamentos simples', isIncluded: true, sortOrder: 4 },
        ]);

        await db.insert(subscriptionPlanFeatures).values([
          { planId: p1.id, featureKey: 'gallery_photos', featureName: 'Limite de Fotos', featureType: 'numeric', numericValue: 10, isUnlimited: false },
          { planId: p1.id, featureKey: 'service_cities', featureName: 'Cidades Atendidas', featureType: 'numeric', numericValue: 1, isUnlimited: false },
          { planId: p1.id, featureKey: 'categories', featureName: 'Categorias Ativas', featureType: 'numeric', numericValue: 1, isUnlimited: false },
          { planId: p1.id, featureKey: 'monthly_leads', featureName: 'Leads por Mês', featureType: 'numeric', numericValue: 5, isUnlimited: false },
          { planId: p1.id, featureKey: 'verified_badge', featureName: 'Selo Verificado', featureType: 'boolean', booleanValue: false },
          { planId: p1.id, featureKey: 'crm_access', featureName: 'Acesso ao CRM', featureType: 'boolean', booleanValue: true },
        ]);
      }

      // Plan 2: Destaque
      const [p2] = await db.insert(subscriptionPlans).values({
        name: 'Plano Destaque',
        internalName: 'destaque',
        slug: 'plano-destaque',
        internalCode: 'PLAN_DESTAQUE',
        shortDescription: 'Aumente seus fechamentos de contratos na cidade.',
        description: 'Destaque regional com topo das buscas e selo de verificação.',
        currency: 'BRL',
        isFree: false,
        monthlyPrice: '89.00',
        annualPrice: '890.00',
        annualMonthlyEquivalent: '74.17',
        annualSavingsAmount: '178.00',
        annualDiscountPercentage: '16.67',
        textBelowPrice: '/mês ou R$ 890/ano',
        badgeText: 'Mais recomendado',
        buttonText: 'Assinar Plano Destaque',
        mainColor: '#C88E9B',
        textColor: '#5A4035',
        buttonColor: '#C88E9B',
        icon: 'Sparkles',
        isRecommended: true,
        isPremium: false,
        isFeatured: true,
        showOnHome: true,
        showOnPricingPage: true,
        showOnRegistration: true,
        showOnProfessionalDashboard: true,
        sortOrder: 2,
        status: 'active',
      }).$returningId();

      if (p2?.id) {
        await db.insert(subscriptionPlanItems).values([
          { planId: p2.id, title: 'Selo Verificado de Qualidade', isIncluded: true, isFeatured: true, sortOrder: 1 },
          { planId: p2.id, title: 'Galeria de fotos ILIMITADA', isIncluded: true, isUnlimited: true, sortOrder: 2 },
          { planId: p2.id, title: 'Inclusão em cotações múltiplas da cidade', isIncluded: true, sortOrder: 3 },
          { planId: p2.id, title: 'CRM de leads com botão WhatsApp direto', isIncluded: true, sortOrder: 4 },
          { planId: p2.id, title: 'Prioridade no topo das buscas regionais', isIncluded: true, sortOrder: 5 },
        ]);

        await db.insert(subscriptionPlanFeatures).values([
          { planId: p2.id, featureKey: 'gallery_photos', featureName: 'Galeria Ilimitada', featureType: 'numeric', isUnlimited: true },
          { planId: p2.id, featureKey: 'verified_badge', featureName: 'Selo Verificado', featureType: 'boolean', booleanValue: true },
          { planId: p2.id, featureKey: 'whatsapp_direct', featureName: 'WhatsApp Direto', featureType: 'boolean', booleanValue: true },
          { planId: p2.id, featureKey: 'search_priority', featureName: 'Prioridade de Busca', featureType: 'boolean', booleanValue: true },
          { planId: p2.id, featureKey: 'crm_access', featureName: 'Acesso ao CRM', featureType: 'boolean', booleanValue: true },
        ]);
      }

      // Plan 3: Premium / Elite
      const [p3] = await db.insert(subscriptionPlans).values({
        name: 'Plano Premium / Elite',
        internalName: 'premium',
        slug: 'plano-premium',
        internalCode: 'PLAN_PREMIUM',
        shortDescription: 'Para estúdios consagrados e cobertura estadual.',
        description: 'Exclusividade máxima com posicionamento fixo e selo premium dourado.',
        currency: 'BRL',
        isFree: false,
        monthlyPrice: '189.00',
        annualPrice: '1890.00',
        annualMonthlyEquivalent: '157.50',
        annualSavingsAmount: '378.00',
        annualDiscountPercentage: '16.67',
        textBelowPrice: '/mês',
        badgeText: 'Para Estúdios Consagrados',
        buttonText: 'Seja Estúdio Premium',
        mainColor: '#5A4035',
        textColor: '#C7A86A',
        buttonColor: '#C7A86A',
        icon: 'Award',
        isRecommended: false,
        isPremium: true,
        isFeatured: true,
        showOnHome: true,
        showOnPricingPage: true,
        showOnRegistration: true,
        showOnProfessionalDashboard: true,
        sortOrder: 3,
        status: 'active',
      }).$returningId();

      if (p3?.id) {
        await db.insert(subscriptionPlanItems).values([
          { planId: p3.id, title: 'Tudo do Plano Destaque', isIncluded: true, sortOrder: 1 },
          { planId: p3.id, title: 'Posicionamento fixo na Home', isIncluded: true, isFeatured: true, sortOrder: 2 },
          { planId: p3.id, title: 'Selo Premium Dourado + Selo Verificado', isIncluded: true, isFeatured: true, sortOrder: 3 },
          { planId: p3.id, title: 'Publicação de casamentos reais no feed', isIncluded: true, sortOrder: 4 },
          { planId: p3.id, title: 'Suporte VIP e relatórios mensais de cliques', isIncluded: true, sortOrder: 5 },
        ]);

        await db.insert(subscriptionPlanFeatures).values([
          { planId: p3.id, featureKey: 'gallery_photos', featureName: 'Galeria Ilimitada', featureType: 'numeric', isUnlimited: true },
          { planId: p3.id, featureKey: 'fixed_home_position', featureName: 'Posição Fixa na Home', featureType: 'boolean', booleanValue: true },
          { planId: p3.id, featureKey: 'premium_badge', featureName: 'Selo Premium Dourado', featureType: 'boolean', booleanValue: true },
          { planId: p3.id, featureKey: 'verified_badge', featureName: 'Selo Verificado', featureType: 'boolean', booleanValue: true },
          { planId: p3.id, featureKey: 'real_weddings', featureName: 'Casamentos Reais', featureType: 'boolean', booleanValue: true },
          { planId: p3.id, featureKey: 'vip_support', featureName: 'Suporte VIP', featureType: 'boolean', booleanValue: true },
          { planId: p3.id, featureKey: 'click_reports', featureName: 'Relatórios de Cliques', featureType: 'boolean', booleanValue: true },
        ]);
      }

      console.log('✓ Commercial Subscription Plans seeded');
    }

    console.log('✓ Checklists & Demo Leads seeded');
    console.log('🎉 MySQL Database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding MySQL database:', err);
    throw err;
  }
}
