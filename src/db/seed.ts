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
} from './schema.ts';
import { BRAZIL_STATES, MOCK_PHOTOGRAPHERS, RECENT_WEDDINGS, BLOG_ARTICLES, INITIAL_CHECKLIST } from '../data/mockData.ts';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('Starting MySQL Database Seed...');

  try {
    // 1. Seed Super Admin & Admin Users
    // Super admin: Rafael (senha: 2705#Data)
    // Admin: guiafotografo (senha: fotografia2026)
    const superAdminPassHash = await bcrypt.hash('2705#Data', 10);
    const adminPassHash = await bcrypt.hash('fotografia2026', 10);

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
          photographersCount: stateData.photographersCount,
          showInNavigation: true,
          sortOrder: index + 1,
          status: 'active',
          seoTitle: `Fotógrafos de Casamento em ${stateData.name} - ${stateData.uf}`,
          seoDescription: `Guia completo dos melhores fotógrafos de casamento em ${stateData.name}. Compare preços, portfólios e peça orçamentos grátis.`,
        });
        stateId = (stRes as any).insertId;
      } else {
        stateId = existingState[0].id;
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
        slug: 'gratuito',
        price: 0,
        photoLimit: 6,
        featured: false,
        description: 'Perfil básico para fotógrafos iniciantes no portal.',
        features: ['Até 6 fotos na galeria', 'Receba solicitações de orçamento', 'Perfil na busca por cidade'],
      },
      {
        name: 'Destaque',
        slug: 'destaque',
        price: 99,
        photoLimit: 20,
        featured: true,
        description: 'Ideal para ter mais destaque e receber mais orçamentos.',
        features: ['Até 20 fotos e vídeos', 'Selo Verificado e Destaque', 'Botão de WhatsApp direto', 'Posição privilegiada nas buscas'],
      },
      {
        name: 'Premium',
        slug: 'premium',
        price: 199,
        photoLimit: 50,
        featured: true,
        description: 'Máxima visibilidade no portal, topo das buscas e banner.',
        features: ['Fotos ilimitadas e vídeos HD', 'Destaque na página inicial', 'Selo Premium + Top Avaliado', 'Acesso ao comparador e estatísticas detalhadas'],
      },
    ];

    for (const plan of plansData) {
      const existingPlan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.slug, plan.slug));
      if (existingPlan.length === 0) {
        await db.insert(subscriptionPlans).values(plan);
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
          status: 'approved',
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

    // 7. Seed Demo Checklists
    for (const item of INITIAL_CHECKLIST) {
      await db.insert(userChecklists).values({
        userUid: 'client-demo-uid-camila',
        task: item.task,
        timeframe: item.timeframe,
        completed: item.completed,
        category: item.category,
      });
    }

    // 8. Seed Demo Leads
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

    // 9. Seed Commercial Subscription Plans
    const existingPlans = await db.select().from(subscriptionPlans);
    if (existingPlans.length === 0) {
      // Plan 1: Gratuito
      const [p1] = await db.insert(subscriptionPlans).values({
        name: 'Plano Gratuito',
        internalName: 'gratuito',
        slug: 'plano-gratuito',
        internalCode: 'PLAN_GRATUITO',
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
  }
}
