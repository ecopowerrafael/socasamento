import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db/index.ts';
import { users, photographers, coupleProfiles, weddingBudgets, weddingBudgetCategories, weddingTasks, weddingTimelines, weddingTimelineItems, achievements, userAchievements, passwordResets } from '../db/schema.ts';
import { eq, or, and, gte } from 'drizzle-orm';
import { signToken, requireAuth, getTokenFromReq, verifyToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

router.post('/register-photographer', async (req, res) => {
  try {
    const { name, email, password, studioName, city, state, phone } = req.body;
    if (!name || !email || !password || password.length < 6 || !city || !state) {
      return res.status(400).json({ success: false, error: 'Nome, e-mail, cidade, estado e senha com pelo menos 6 caracteres são obrigatórios.' });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    if ((await db.select({ id: users.id }).from(users).where(eq(users.email, cleanEmail)).limit(1)).length) {
      return res.status(409).json({ success: false, error: 'Este e-mail já está cadastrado.' });
    }
    const cleanStudioName = String(studioName || name).trim();
    const baseSlug = cleanStudioName.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    let suffix = 1;
    while ((await db.select({ id: photographers.id }).from(photographers).where(eq(photographers.slug, slug)).limit(1)).length) {
      slug = `${baseSlug}-${suffix++}`;
    }
    const uid = `photographer-${crypto.randomUUID()}`;
    const created = await db.transaction(async (tx) => {
      const [userResult] = await tx.insert(users).values({
        uid,
        name: String(name).trim(),
        email: cleanEmail,
        phone: phone || null,
        passwordHash: await bcrypt.hash(password, 10),
        role: 'photographer',
        status: 'active',
      }).$returningId();
      const [photographerResult] = await tx.insert(photographers).values({
        userId: userResult.id,
        userUid: uid,
        slug,
        name: String(name).trim(),
        studioName: cleanStudioName,
        avatar: '/apple-touch-icon.png',
        coverImage: '/apple-touch-icon.png',
        city: String(city).trim(),
        state: String(state).trim().toUpperCase().slice(0, 2),
        phone: phone || null,
        whatsapp: phone ? String(phone).replace(/\D/g, '') : null,
        email: cleanEmail,
        styles: [],
        deliverables: [],
        categories: ['Fotógrafos'],
        badges: [],
        faqs: [],
        status: 'approved',
        plan: 'Gratuito',
      }).$returningId();
      return { userId: userResult.id, photographerId: photographerResult.id };
    });
    const token = signToken({
      uid,
      id: created.userId,
      email: cleanEmail,
      name: String(name).trim(),
      role: 'photographer',
      photographerId: String(created.photographerId),
      studioName: cleanStudioName,
    });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({
      success: true,
      token,
      user: { id: created.userId, uid, name, email: cleanEmail, role: 'photographer', photographerId: String(created.photographerId) },
      photographerProfile: { id: created.photographerId, slug, name, studioName: cleanStudioName, city, state },
    });
  } catch (error: any) {
    console.error('Erro no cadastro de fotógrafo:', error);
    return res.status(500).json({ success: false, error: 'Não foi possível concluir o cadastro.' });
  }
});

// 1. REGISTER BRIDE / COUPLE (/api/auth/register-bride or /signup-bride)
router.post('/register-bride', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      partnerName,
      weddingDate,
      stateId,
      cityId,
      termsAccepted,
      privacyConsent,
      marketingConsent,
      weddingType,
      estimatedGuests,
      estimatedBudget,
      weddingStyle,
      ceremonyLocation,
      receptionLocation,
      couplePhoto,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    if (!termsAccepted || !privacyConsent) {
      return res.status(400).json({
        success: false,
        error: 'Você precisa aceitar os Termos de Uso e a Política de Privacidade para se cadastrar.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, cleanEmail));
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Este e-mail já está cadastrado. Faça login para acessar sua conta.',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userUid = `bride-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Insert user
    const [userInsert] = await db.insert(users).values({
      uid: userUid,
      name,
      email: cleanEmail,
      phone: phone || null,
      passwordHash,
      role: 'BRIDE',
      status: 'active',
      termsAcceptedAt: new Date(),
      privacyConsentAt: new Date(),
      marketingConsentAt: marketingConsent ? new Date() : null,
      lastLoginAt: new Date(),
    });

    const userId = Number(userInsert.insertId);

    // Create Couple Profile
    const parsedBudget = estimatedBudget ? String(estimatedBudget) : '80000.00';
    const parsedGuests = estimatedGuests ? Number(estimatedGuests) : 100;

    await db.insert(coupleProfiles).values({
      userId,
      partnerName: partnerName || 'Parceiro(a)',
      weddingDate: weddingDate || null,
      weddingType: weddingType || 'Tradicional',
      estimatedGuests: parsedGuests,
      estimatedBudget: parsedBudget,
      weddingStyle: weddingStyle || 'Clássico / Elegante',
      ceremonyLocation: ceremonyLocation || null,
      receptionLocation: receptionLocation || null,
      stateId: stateId ? Number(stateId) : null,
      cityId: cityId ? Number(cityId) : null,
      couplePhoto: couplePhoto || null,
      planningProgress: 10,
    });

    // Create Budget & Categories
    const [budgetInsert] = await db.insert(weddingBudgets).values({
      userId,
      totalBudget: parsedBudget,
      currency: 'BRL',
    });
    const budgetId = Number(budgetInsert.insertId);

    const defaultBudgetNum = parseFloat(parsedBudget) || 80000;
    const defaultCategories = [
      { name: 'Buffet & Bebidas', pct: '35.00' },
      { name: 'Espaço & Decoração', pct: '20.00' },
      { name: 'Fotografia & Filme', pct: '18.00' },
      { name: 'Trajes & Beleza', pct: '12.00' },
      { name: 'Música & Iluminação', pct: '8.00' },
      { name: 'Convites & Lembrancinhas', pct: '4.00' },
      { name: 'Outros & Reserva', pct: '3.00' },
    ];

    for (let i = 0; i < defaultCategories.length; i++) {
      const cat = defaultCategories[i];
      const planned = (defaultBudgetNum * (parseFloat(cat.pct) / 100)).toFixed(2);
      await db.insert(weddingBudgetCategories).values({
        budgetId,
        categoryName: cat.name,
        percentage: cat.pct,
        plannedAmount: planned,
        actualAmount: '0.00',
        sortOrder: i + 1,
      });
    }

    // Insert Default Tasks Checklist
    const defaultTasks = [
      { title: 'Definir orçamento geral e estilo do casamento', category: 'Planejamento', recMonth: '12 meses antes', priority: 'high', sortOrder: 1 },
      { title: 'Escolher o local da cerimônia e da festa', category: 'Local', recMonth: '12 meses antes', priority: 'high', sortOrder: 2 },
      { title: 'Contratar o fotógrafo e a equipe de filmagem', category: 'Fotografia', recMonth: '10 meses antes', priority: 'high', sortOrder: 3 },
      { title: 'Elaborar a lista preliminar de convidados', category: 'Convidados', recMonth: '10 meses antes', priority: 'medium', sortOrder: 4 },
      { title: 'Contratar serviço de buffet e decoração', category: 'Buffet', recMonth: '8 meses antes', priority: 'high', sortOrder: 5 },
      { title: 'Escolher o vestido de noiva / trajes', category: 'Vestuário', recMonth: '6 meses antes', priority: 'high', sortOrder: 6 },
      { title: 'Enviar convites para os padrinhos e convidados', category: 'Convites', recMonth: '3 meses antes', priority: 'medium', sortOrder: 7 },
      { title: 'Fazer degustação e prova final do bolo e doces', category: 'Buffet', recMonth: '2 meses antes', priority: 'low', sortOrder: 8 },
      { title: 'Reunião de alinhamento com fotógrafo e cerimonial', category: 'Fotografia', recMonth: '1 mês antes', priority: 'high', sortOrder: 9 },
      { title: 'Confirmar presença final (RSVP) com os convidados', category: 'Convidados', recMonth: '2 semanas antes', priority: 'high', sortOrder: 10 },
      { title: 'Ensaio Pré-Wedding e revisão do cronograma do dia', category: 'Fotografia', recMonth: '1 semana antes', priority: 'medium', sortOrder: 11 },
      { title: 'Aproveitar o dia inesquecível do seu casamento!', category: 'Geral', recMonth: 'Dia do Casamento', priority: 'high', sortOrder: 12 },
    ];

    for (const t of defaultTasks) {
      await db.insert(weddingTasks).values({
        userId,
        title: t.title,
        category: t.category,
        recommendedMonth: t.recMonth,
        priority: t.priority,
        isCompleted: false,
        sortOrder: t.sortOrder,
      });
    }

    // Insert Default Timeline
    const [timelineInsert] = await db.insert(weddingTimelines).values({
      userId,
      title: 'Cronograma Padrão do Casamento',
      weddingDate: weddingDate || null,
    });
    const timelineId = Number(timelineInsert.insertId);

    const defaultTimelineItems = [
      { time: '08:00', title: 'Make & Hair da Noiva', desc: 'Início do dia da noiva no camarim/salão', resp: 'Maquiadora & Cabeleireira', sortOrder: 1 },
      { time: '13:00', title: 'Chegada da Fotografia no Making Of', desc: 'Registro dos preparativos e detalhes dos trajes e acessórios', resp: 'Equipe de Fotografia', sortOrder: 2 },
      { time: '16:00', title: 'Chegada ao Local da Cerimônia', desc: 'Ajustes finais e retratos a sós da noiva com os pais', resp: 'Cerimonial & Fotógrafo', sortOrder: 3 },
      { time: '17:00', title: 'Início da Cerimônia', desc: 'Entrada dos padrinhos, noivo, florista e noiva', resp: 'Celebrante & Músicos', sortOrder: 4 },
      { time: '18:15', title: 'Fotos Oficiais com Padrinhos e Família', desc: 'Sessão rápida no altar/cenário do casamento', resp: 'Fotógrafo', sortOrder: 5 },
      { time: '19:00', title: 'Entrada dos Noivos na Festa & Brinde', desc: 'Corte simbólico do bolo e recepção dos convidados', resp: 'DJ & Cerimonial', sortOrder: 6 },
      { time: '19:30', title: 'Abertura do Buffet e Jantar', desc: 'Serviço de alimentos e bebidas para os convidados', resp: 'Buffet', sortOrder: 7 },
      { time: '20:30', title: 'Primeira Dança dos Noivos & Pista Aberta', desc: 'Abertura oficial da pista de dança para comemoração', resp: 'Banda / DJ', sortOrder: 8 },
      { time: '23:50', title: 'Encerramento e Saída dos Noivos', desc: 'Foto de despedida e entrega de lembrancinhas', resp: 'Cerimonial', sortOrder: 9 },
    ];

    for (const item of defaultTimelineItems) {
      await db.insert(weddingTimelineItems).values({
        timelineId,
        time: item.time,
        title: item.title,
        description: item.desc,
        responsible: item.resp,
        sortOrder: item.sortOrder,
      });
    }

    // Unlock initial achievement
    try {
      const existingAch = await db.select().from(achievements).where(eq(achievements.slug, 'primeiros-passos'));
      let achId = existingAch[0]?.id;
      if (!achId) {
        const [achInsert] = await db.insert(achievements).values({
          name: 'Primeiros Passos',
          slug: 'primeiros-passos',
          description: 'Cadastrou sua conta no Portal do Casal',
          icon: 'Sparkles',
          category: 'Onboarding',
        });
        achId = Number(achInsert.insertId);
      }
      await db.insert(userAchievements).values({ userId, achievementId: achId });
    } catch (e) {
      // ignore
    }

    // Generate JWT token
    const token = signToken({
      uid: userUid,
      id: userId,
      email: cleanEmail,
      name,
      role: 'BRIDE',
    });

    // Set cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: 'Cadastro de noiva realizado com sucesso!',
      token,
      user: {
        id: userId,
        uid: userUid,
        name,
        email: cleanEmail,
        phone,
        role: 'BRIDE',
        partnerName,
        weddingDate,
      },
    });
  } catch (err: any) {
    console.error('Erro no cadastro de noiva:', err);
    return res.status(500).json({
      success: false,
      error: 'Ocorreu um erro interno ao realizar o cadastro. Tente novamente.',
    });
  }
});

// 2. LOGIN USER (/api/auth/login)
router.post('/login', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const loginIdentifier = (email || username || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, error: 'Por favor, informe e-mail e senha.' });
    }

    const cleanEmail = loginIdentifier.toLowerCase();

    // Check database
    const dbUsers = await db.select().from(users).where(
      or(eq(users.email, cleanEmail), eq(users.uid, loginIdentifier), eq(users.name, loginIdentifier)),
    );
    if (dbUsers.length === 0) {
      return res.status(401).json({ success: false, error: 'E-mail ou senha incorretos.' });
    }

    const user = dbUsers[0];

    // Check password
    let isValidPass = false;
    if (user.passwordHash) {
      if (user.passwordHash.startsWith('$2')) {
        isValidPass = await bcrypt.compare(password, user.passwordHash);
      }
    }

    if (!isValidPass) {
      return res.status(401).json({ success: false, error: 'E-mail ou senha incorretos.' });
    }

    // Update last login
    try {
      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    } catch (e) {
      // non-critical
    }

    // Fetch couple profile if bride
    let coupleProf = null;
    if (['bride', 'client'].includes(String(user.role).toLowerCase())) {
      const profs = await db.select().from(coupleProfiles).where(eq(coupleProfiles.userId, user.id));
      if (profs.length > 0) coupleProf = profs[0];
    }

    // Map role to standard target path
    let role = String(user.role || 'bride').toLowerCase();
    if (role === 'client') role = 'bride';

    let redirectUrl = '/portal-do-casal';
    if (role === 'admin' || role === 'super_admin') redirectUrl = '/admin';
    if (role === 'photographer') redirectUrl = '/painel-profissional';

    const [photographerProfile] = role === 'photographer'
      ? await db.select().from(photographers).where(eq(photographers.userId, user.id)).limit(1)
      : [];

    const token = signToken({
      uid: user.uid,
      id: user.id,
      email: user.email,
      name: user.name,
      role,
      photographerId: photographerProfile ? String(photographerProfile.id) : undefined,
      studioName: photographerProfile?.studioName || undefined,
    });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      redirectUrl,
      user: {
        id: user.id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role,
        avatar: user.avatar,
        partnerName: coupleProf?.partnerName || null,
        weddingDate: coupleProf?.weddingDate || null,
        photographerId: photographerProfile ? String(photographerProfile.id) : undefined,
      },
      photographerProfile: photographerProfile || null,
    });
  } catch (err: any) {
    console.error('Erro no login:', err);
    return res.status(500).json({ success: false, error: 'Erro ao processar login.' });
  }
});

// 3. GET CURRENT LOGGED IN USER (/api/auth/me)
router.get('/me', async (req, res) => {
  const token = getTokenFromReq(req);
  if (!token) {
    return res.status(401).json({ success: false, user: null });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    return res.status(401).json({ success: false, user: null });
  }

  try {
    const dbUsers = await db.select().from(users).where(eq(users.id, Number(decoded.id)));
    if (dbUsers.length === 0) {
      return res.status(401).json({ success: false, user: null });
    }

    const user = dbUsers[0];
    let coupleProf: any = null;

    if (['bride', 'client'].includes(String(user.role).toLowerCase())) {
      const profs = await db.select().from(coupleProfiles).where(eq(coupleProfiles.userId, user.id));
      if (profs.length > 0) coupleProf = profs[0];
    }

    let normalizedRole = String(user.role || 'bride').toLowerCase();
    if (normalizedRole === 'client') normalizedRole = 'bride';
    const [photographerProfile] = normalizedRole === 'photographer'
      ? await db.select().from(photographers).where(eq(photographers.userId, user.id)).limit(1)
      : [];

    return res.json({
      success: true,
      user: {
        id: user.id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: normalizedRole,
        avatar: user.avatar,
        partnerName: coupleProf?.partnerName || null,
        weddingDate: coupleProf?.weddingDate || null,
        coupleProfile: coupleProf,
        photographerId: photographerProfile ? String(photographerProfile.id) : undefined,
      },
      photographerProfile: photographerProfile || null,
    });
  } catch (err) {
    return res.status(401).json({ success: false, user: null });
  }
});

// 4. LOGOUT (/api/auth/logout)
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.clearCookie('token');
  return res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

// 5. FORGOT PASSWORD (/api/auth/forgot-password)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Por favor, informe seu e-mail.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const dbUsers = await db.select().from(users).where(eq(users.email, cleanEmail));

    if (dbUsers.length === 0) {
      // Don't leak registered emails for security
      return res.json({
        success: true,
        message: 'Se este e-mail estiver cadastrado, enviamos um link para redefinição de senha.',
      });
    }

    const user = dbUsers[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResets).values({
      userId: user.id,
      email: cleanEmail,
      token,
      expiresAt,
    });

    const resetUrl = `/redefinir-senha?token=${token}`;

    return res.json({
      success: true,
      message: 'Enviamos o link de redefinição de senha para o seu e-mail.',
      // For development simulation:
      devResetLink: resetUrl,
    });
  } catch (err: any) {
    console.error('Erro ao solicitar redefinição de senha:', err);
    return res.status(500).json({ success: false, error: 'Erro ao processar solicitação de senha.' });
  }
});

// 6. RESET PASSWORD (/api/auth/reset-password)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Token e nova senha são obrigatórios.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'A nova senha deve possuir no mínimo 6 caracteres.' });
    }

    // Find token
    const resets = await db
      .select()
      .from(passwordResets)
      .where(and(eq(passwordResets.token, token), gte(passwordResets.expiresAt, new Date())));

    if (resets.length === 0 || resets[0].usedAt) {
      return res.status(400).json({
        success: false,
        error: 'O token de redefinição de senha é inválido ou já expirou.',
      });
    }

    const resetReq = resets[0];
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, resetReq.userId));

    // Mark token as used
    await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, resetReq.id));

    return res.json({
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode fazer login com a nova senha.',
    });
  } catch (err: any) {
    console.error('Erro ao redefinir senha:', err);
    return res.status(500).json({ success: false, error: 'Erro ao redefinir senha.' });
  }
});

export default router;
