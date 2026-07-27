import { Router } from 'express';
import { db } from '../db/index.ts';
import {
  users,
  coupleProfiles,
  weddingTasks,
  weddingEvents,
  weddingBudgets,
  weddingBudgetCategories,
  weddingExpenses,
  installmentSimulations,
  weddingGuests,
  weddingGifts,
  inspirationFavorites,
  photographerFavorites,
  photoLocationFavorites,
  photographyQuoteSimulations,
  photographyQuoteRequests,
  weddingTimelines,
  weddingTimelineItems,
  weddingWebsites,
  weddingRsvps,
  weddingStyleQuizResults,
  achievements,
  userAchievements,
  photographers,
} from '../db/schema.ts';
import { eq, and, asc, desc, sql, isNull } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Middleware to extract logged in user ID safely
function getUserId(req: AuthRequest): number {
  if (!req.user || !req.user.id) {
    throw new Error('UNAUTHORIZED');
  }
  return Number(req.user.id);
}

// ============================================================================
// 1. PROFILE & ONBOARDING
// ============================================================================

// GET /api/bride/profile
router.get('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const userList = await db.select().from(users).where(eq(users.id, userId));
    if (userList.length === 0) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });

    const profs = await db.select().from(coupleProfiles).where(eq(coupleProfiles.userId, userId));
    const profile = profs[0] || null;

    return res.json({
      success: true,
      user: {
        id: userList[0].id,
        name: userList[0].name,
        email: userList[0].email,
        phone: userList[0].phone,
        avatar: userList[0].avatar,
      },
      profile,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/bride/profile
router.put('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const {
      name,
      phone,
      partnerName,
      weddingDate,
      weddingType,
      estimatedGuests,
      estimatedBudget,
      weddingStyle,
      ceremonyLocation,
      receptionLocation,
      stateId,
      cityId,
      couplePhoto,
    } = req.body;

    // Update user info
    if (name || phone) {
      await db.update(users).set({
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        updatedAt: new Date(),
      }).where(eq(users.id, userId));
    }

    // Update couple profile
    const profs = await db.select().from(coupleProfiles).where(eq(coupleProfiles.userId, userId));
    if (profs.length === 0) {
      await db.insert(coupleProfiles).values({
        userId,
        partnerName: partnerName || 'Parceiro(a)',
        weddingDate: weddingDate || null,
        weddingType: weddingType || 'Tradicional',
        estimatedGuests: estimatedGuests ? Number(estimatedGuests) : 100,
        estimatedBudget: estimatedBudget ? String(estimatedBudget) : '80000.00',
        weddingStyle: weddingStyle || 'Clássico',
        ceremonyLocation: ceremonyLocation || null,
        receptionLocation: receptionLocation || null,
        stateId: stateId ? Number(stateId) : null,
        cityId: cityId ? Number(cityId) : null,
        couplePhoto: couplePhoto || null,
      });
    } else {
      await db.update(coupleProfiles).set({
        ...(partnerName !== undefined ? { partnerName } : {}),
        ...(weddingDate !== undefined ? { weddingDate } : {}),
        ...(weddingType !== undefined ? { weddingType } : {}),
        ...(estimatedGuests !== undefined ? { estimatedGuests: Number(estimatedGuests) } : {}),
        ...(estimatedBudget !== undefined ? { estimatedBudget: String(estimatedBudget) } : {}),
        ...(weddingStyle !== undefined ? { weddingStyle } : {}),
        ...(ceremonyLocation !== undefined ? { ceremonyLocation } : {}),
        ...(receptionLocation !== undefined ? { receptionLocation } : {}),
        ...(stateId !== undefined ? { stateId: Number(stateId) } : {}),
        ...(cityId !== undefined ? { cityId: Number(cityId) } : {}),
        ...(couplePhoto !== undefined ? { couplePhoto } : {}),
        updatedAt: new Date(),
      }).where(eq(coupleProfiles.userId, userId));
    }

    const updatedProfs = await db.select().from(coupleProfiles).where(eq(coupleProfiles.userId, userId));
    return res.json({ success: true, profile: updatedProfs[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 2. DASHBOARD AGGREGATED METRICS
// ============================================================================

// GET /api/bride/dashboard
router.get('/dashboard', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);

    // Profile & Wedding Date
    const profs = await db.select().from(coupleProfiles).where(eq(coupleProfiles.userId, userId));
    const profile = profs[0] || null;

    let daysRemaining = 0;
    let weeksRemaining = 0;
    if (profile?.weddingDate) {
      const wDate = new Date(profile.weddingDate);
      const now = new Date();
      const diffTime = wDate.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      weeksRemaining = Math.max(0, Math.ceil(daysRemaining / 7));
    }

    // Tasks (Checklist)
    const tasksList = await db.select().from(weddingTasks).where(and(eq(weddingTasks.userId, userId), isNull(weddingTasks.deletedAt)));
    const totalTasks = tasksList.length;
    const completedTasks = tasksList.filter((t) => t.isCompleted).length;
    const checklistProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Budget & Expenses
    const budgetList = await db.select().from(weddingBudgets).where(eq(weddingBudgets.userId, userId));
    const totalBudget = budgetList[0] ? parseFloat(budgetList[0].totalBudget || '0') : parseFloat(profile?.estimatedBudget || '80000');

    const expensesList = await db.select().from(weddingExpenses).where(and(eq(weddingExpenses.userId, userId), isNull(weddingExpenses.deletedAt)));
    let contractedTotal = 0;
    let paidTotal = 0;
    let remainingTotal = 0;

    expensesList.forEach((e) => {
      contractedTotal += parseFloat(e.contractedAmount || '0');
      paidTotal += parseFloat(e.paidAmount || '0');
      remainingTotal += parseFloat(e.remainingAmount || '0');
    });

    // Guests
    const guestsList = await db.select().from(weddingGuests).where(and(eq(weddingGuests.userId, userId), isNull(weddingGuests.deletedAt)));
    let totalGuests = 0;
    let confirmedGuests = 0;
    let pendingGuests = 0;
    let declinedGuests = 0;

    guestsList.forEach((g) => {
      const count = 1 + (g.companions || 0);
      totalGuests += count;
      if (g.confirmationStatus === 'confirmed') confirmedGuests += count;
      else if (g.confirmationStatus === 'declined') declinedGuests += count;
      else pendingGuests += count;
    });

    // Gifts
    const giftsList = await db.select().from(weddingGifts).where(and(eq(weddingGifts.userId, userId), isNull(weddingGifts.deletedAt)));
    const totalGifts = giftsList.length;
    const purchasedGifts = giftsList.filter((g) => g.isPurchased).length;

    // Upcoming Events / Appointments
    const upcomingEvents = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.userId, userId), isNull(weddingEvents.deletedAt)))
      .orderBy(asc(weddingEvents.startAt))
      .limit(5);

    // Recent Quote Requests
    const recentQuoteRequests = await db
      .select()
      .from(photographyQuoteRequests)
      .where(eq(photographyQuoteRequests.userId, userId))
      .orderBy(desc(photographyQuoteRequests.createdAt))
      .limit(5);

    // Favorites
    const favPhotographers = await db.select().from(photographerFavorites).where(eq(photographerFavorites.userId, userId));
    const favInspirations = await db.select().from(inspirationFavorites).where(eq(inspirationFavorites.userId, userId));

    // Achievements
    const userAchs = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));

    return res.json({
      success: true,
      dashboard: {
        coupleName: profile ? `${profile.partnerName ? `Noiva & ${profile.partnerName}` : 'Casal'}` : 'Casal',
        weddingDate: profile?.weddingDate || null,
        weddingStyle: profile?.weddingStyle || 'Clássico',
        daysRemaining,
        weeksRemaining,
        checklist: {
          total: totalTasks,
          completed: completedTasks,
          progressPercentage: checklistProgress,
        },
        financials: {
          totalBudget,
          contractedTotal,
          paidTotal,
          remainingTotal,
        },
        guests: {
          total: totalGuests,
          confirmed: confirmedGuests,
          pending: pendingGuests,
          declined: declinedGuests,
        },
        gifts: {
          total: totalGifts,
          purchased: purchasedGifts,
        },
        upcomingEvents,
        recentQuoteRequests,
        favoritesCount: {
          photographers: favPhotographers.length,
          inspirations: favInspirations.length,
        },
        unlockedAchievementsCount: userAchs.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 3. CHECKLIST (TASKS)
// ============================================================================

// GET /api/bride/tasks
router.get('/tasks', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const tasks = await db
      .select()
      .from(weddingTasks)
      .where(and(eq(weddingTasks.userId, userId), isNull(weddingTasks.deletedAt)))
      .orderBy(asc(weddingTasks.sortOrder), asc(weddingTasks.id));

    return res.json({ success: true, tasks });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bride/tasks
router.post('/tasks', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const { title, description, category, recommendedMonth, dueDate, priority } = req.body;

    if (!title) return res.status(400).json({ success: false, error: 'Título da tarefa é obrigatório.' });

    const [insert] = await db.insert(weddingTasks).values({
      userId,
      title,
      description: description || null,
      category: category || 'Geral',
      recommendedMonth: recommendedMonth || 'Personalizado',
      dueDate: dueDate || null,
      priority: priority || 'medium',
      isCompleted: false,
    });

    const newTask = await db.select().from(weddingTasks).where(eq(weddingTasks.id, Number(insert.insertId)));
    return res.status(201).json({ success: true, task: newTask[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/bride/tasks/:id
router.put('/tasks/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const existing = await db
      .select()
      .from(weddingTasks)
      .where(and(eq(weddingTasks.id, id), eq(weddingTasks.userId, userId), isNull(weddingTasks.deletedAt)));

    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Tarefa não encontrada.' });

    const { title, description, category, recommendedMonth, dueDate, priority, isCompleted } = req.body;

    await db
      .update(weddingTasks)
      .set({
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(recommendedMonth !== undefined ? { recommendedMonth } : {}),
        ...(dueDate !== undefined ? { dueDate } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(isCompleted !== undefined ? { isCompleted, completedAt: isCompleted ? new Date() : null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(weddingTasks.id, id));

    const updated = await db.select().from(weddingTasks).where(eq(weddingTasks.id, id));
    return res.json({ success: true, task: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/bride/tasks/:id/complete
router.patch('/tasks/:id/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const existing = await db
      .select()
      .from(weddingTasks)
      .where(and(eq(weddingTasks.id, id), eq(weddingTasks.userId, userId), isNull(weddingTasks.deletedAt)));

    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Tarefa não encontrada.' });

    const newCompleted = !existing[0].isCompleted;
    await db
      .update(weddingTasks)
      .set({
        isCompleted: newCompleted,
        completedAt: newCompleted ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(weddingTasks.id, id));

    const updated = await db.select().from(weddingTasks).where(eq(weddingTasks.id, id));
    return res.json({ success: true, task: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/bride/tasks/:id
router.delete('/tasks/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const existing = await db
      .select()
      .from(weddingTasks)
      .where(and(eq(weddingTasks.id, id), eq(weddingTasks.userId, userId), isNull(weddingTasks.deletedAt)));

    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Tarefa não encontrada.' });

    await db.update(weddingTasks).set({ deletedAt: new Date() }).where(eq(weddingTasks.id, id));
    return res.json({ success: true, message: 'Tarefa removida com sucesso.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 4. EVENTS (AGENDA)
// ============================================================================

// GET /api/bride/events
router.get('/events', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const events = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.userId, userId), isNull(weddingEvents.deletedAt)))
      .orderBy(asc(weddingEvents.startAt));

    return res.json({ success: true, events });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bride/events
router.post('/events', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const { title, description, eventType, location, startAt, endAt, allDay, reminderEnabled, reminderMinutes } = req.body;

    if (!title) return res.status(400).json({ success: false, error: 'Título do compromisso é obrigatório.' });

    const [insert] = await db.insert(weddingEvents).values({
      userId,
      title,
      description: description || null,
      eventType: eventType || 'Reunião',
      location: location || null,
      startAt: startAt || new Date().toISOString(),
      endAt: endAt || null,
      allDay: allDay || false,
      reminderEnabled: reminderEnabled !== undefined ? reminderEnabled : true,
      reminderMinutes: reminderMinutes ? Number(reminderMinutes) : 60,
    });

    const newEv = await db.select().from(weddingEvents).where(eq(weddingEvents.id, Number(insert.insertId)));
    return res.status(201).json({ success: true, event: newEv[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/bride/events/:id
router.put('/events/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const existing = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.id, id), eq(weddingEvents.userId, userId), isNull(weddingEvents.deletedAt)));

    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Compromisso não encontrado.' });

    const { title, description, eventType, location, startAt, endAt, allDay, reminderEnabled, reminderMinutes, status } = req.body;

    await db
      .update(weddingEvents)
      .set({
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(eventType !== undefined ? { eventType } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(startAt !== undefined ? { startAt } : {}),
        ...(endAt !== undefined ? { endAt } : {}),
        ...(allDay !== undefined ? { allDay } : {}),
        ...(reminderEnabled !== undefined ? { reminderEnabled } : {}),
        ...(reminderMinutes !== undefined ? { reminderMinutes: Number(reminderMinutes) } : {}),
        ...(status !== undefined ? { status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(weddingEvents.id, id));

    const updated = await db.select().from(weddingEvents).where(eq(weddingEvents.id, id));
    return res.json({ success: true, event: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/bride/events/:id
router.delete('/events/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const existing = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.id, id), eq(weddingEvents.userId, userId), isNull(weddingEvents.deletedAt)));

    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Compromisso não encontrado.' });

    await db.update(weddingEvents).set({ deletedAt: new Date() }).where(eq(weddingEvents.id, id));
    return res.json({ success: true, message: 'Compromisso excluído com sucesso.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 5. BUDGET & EXPENSES
// ============================================================================

// GET /api/bride/budget
router.get('/budget', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);

    let bList = await db.select().from(weddingBudgets).where(eq(weddingBudgets.userId, userId));
    let budget = bList[0];

    if (!budget) {
      const [bInsert] = await db.insert(weddingBudgets).values({ userId, totalBudget: '80000.00' });
      const newB = await db.select().from(weddingBudgets).where(eq(weddingBudgets.id, Number(bInsert.insertId)));
      budget = newB[0];
    }

    const categories = await db
      .select()
      .from(weddingBudgetCategories)
      .where(eq(weddingBudgetCategories.budgetId, budget.id))
      .orderBy(asc(weddingBudgetCategories.sortOrder));

    const expenses = await db
      .select()
      .from(weddingExpenses)
      .where(and(eq(weddingExpenses.userId, userId), isNull(weddingExpenses.deletedAt)))
      .orderBy(desc(weddingExpenses.createdAt));

    return res.json({ success: true, budget, categories, expenses });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/bride/budget
router.put('/budget', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const { totalBudget, categories } = req.body;

    let bList = await db.select().from(weddingBudgets).where(eq(weddingBudgets.userId, userId));
    let budgetId = bList[0]?.id;

    if (!budgetId) {
      const [bInsert] = await db.insert(weddingBudgets).values({ userId, totalBudget: String(totalBudget || '80000.00') });
      budgetId = Number(bInsert.insertId);
    } else if (totalBudget) {
      await db.update(weddingBudgets).set({ totalBudget: String(totalBudget), updatedAt: new Date() }).where(eq(weddingBudgets.id, budgetId));
    }

    // Optionally update category allocations
    if (Array.isArray(categories)) {
      for (const cat of categories) {
        if (cat.id) {
          await db
            .update(weddingBudgetCategories)
            .set({
              categoryName: cat.categoryName,
              percentage: String(cat.percentage),
              plannedAmount: String(cat.plannedAmount),
              actualAmount: String(cat.actualAmount || '0.00'),
            })
            .where(eq(weddingBudgetCategories.id, cat.id));
        }
      }
    }

    const updatedBudget = await db.select().from(weddingBudgets).where(eq(weddingBudgets.id, budgetId));
    const updatedCats = await db.select().from(weddingBudgetCategories).where(eq(weddingBudgetCategories.budgetId, budgetId));

    return res.json({ success: true, budget: updatedBudget[0], categories: updatedCats });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bride/expenses
router.get('/expenses', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const expenses = await db
      .select()
      .from(weddingExpenses)
      .where(and(eq(weddingExpenses.userId, userId), isNull(weddingExpenses.deletedAt)))
      .orderBy(desc(weddingExpenses.createdAt));

    return res.json({ success: true, expenses });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bride/expenses
router.post('/expenses', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const { supplierName, category, description, contractedAmount, paidAmount, dueDate, paymentStatus, paymentMethod, notes } = req.body;

    if (!supplierName) return res.status(400).json({ success: false, error: 'Nome do fornecedor/serviço é obrigatório.' });

    const cAmount = parseFloat(contractedAmount || 0);
    const pAmount = parseFloat(paidAmount || 0);
    const rAmount = Math.max(0, cAmount - pAmount).toFixed(2);

    const [insert] = await db.insert(weddingExpenses).values({
      userId,
      supplierName,
      category: category || 'Outros',
      description: description || null,
      contractedAmount: cAmount.toFixed(2),
      paidAmount: pAmount.toFixed(2),
      remainingAmount: rAmount,
      dueDate: dueDate || null,
      paymentStatus: paymentStatus || (pAmount >= cAmount ? 'Pago' : 'Pendente'),
      paymentMethod: paymentMethod || null,
      notes: notes || null,
    });

    const newExp = await db.select().from(weddingExpenses).where(eq(weddingExpenses.id, Number(insert.insertId)));
    return res.status(201).json({ success: true, expense: newExp[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/bride/expenses/:id
router.put('/expenses/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const existing = await db
      .select()
      .from(weddingExpenses)
      .where(and(eq(weddingExpenses.id, id), eq(weddingExpenses.userId, userId), isNull(weddingExpenses.deletedAt)));

    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Gasto não encontrado.' });

    const { supplierName, category, description, contractedAmount, paidAmount, dueDate, paymentStatus, paymentMethod, notes } = req.body;

    const cAmount = contractedAmount !== undefined ? parseFloat(contractedAmount) : parseFloat(existing[0].contractedAmount || '0');
    const pAmount = paidAmount !== undefined ? parseFloat(paidAmount) : parseFloat(existing[0].paidAmount || '0');
    const rAmount = Math.max(0, cAmount - pAmount).toFixed(2);

    await db
      .update(weddingExpenses)
      .set({
        ...(supplierName !== undefined ? { supplierName } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(description !== undefined ? { description } : {}),
        contractedAmount: cAmount.toFixed(2),
        paidAmount: pAmount.toFixed(2),
        remainingAmount: rAmount,
        ...(dueDate !== undefined ? { dueDate } : {}),
        ...(paymentStatus !== undefined ? { paymentStatus } : { paymentStatus: pAmount >= cAmount ? 'Pago' : 'Pendente' }),
        ...(paymentMethod !== undefined ? { paymentMethod } : {}),
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: new Date(),
      })
      .where(eq(weddingExpenses.id, id));

    const updated = await db.select().from(weddingExpenses).where(eq(weddingExpenses.id, id));
    return res.json({ success: true, expense: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/bride/expenses/:id
router.delete('/expenses/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const existing = await db
      .select()
      .from(weddingExpenses)
      .where(and(eq(weddingExpenses.id, id), eq(weddingExpenses.userId, userId), isNull(weddingExpenses.deletedAt)));

    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Gasto não encontrado.' });

    await db.update(weddingExpenses).set({ deletedAt: new Date() }).where(eq(weddingExpenses.id, id));
    return res.json({ success: true, message: 'Gasto removido com sucesso.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 6. GUESTS (CONVIDADOS)
// ============================================================================

// GET /api/bride/guests
router.get('/guests', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const guests = await db
      .select()
      .from(weddingGuests)
      .where(and(eq(weddingGuests.userId, userId), isNull(weddingGuests.deletedAt)))
      .orderBy(asc(weddingGuests.name));

    return res.json({ success: true, guests });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bride/guests
router.post('/guests', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const { name, phone, email, familyGroup, companions, tableName, sector, invitationStatus, confirmationStatus, dietaryRestrictions, notes } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Nome do convidado é obrigatório.' });

    const [insert] = await db.insert(weddingGuests).values({
      userId,
      name,
      phone: phone || null,
      email: email || null,
      familyGroup: familyGroup || 'Geral',
      companions: companions ? Number(companions) : 0,
      tableName: tableName || null,
      sector: sector || null,
      invitationStatus: invitationStatus || 'Pendente',
      confirmationStatus: confirmationStatus || 'pending',
      dietaryRestrictions: dietaryRestrictions || null,
      notes: notes || null,
    });

    const newGuest = await db.select().from(weddingGuests).where(eq(weddingGuests.id, Number(insert.insertId)));
    return res.status(201).json({ success: true, guest: newGuest[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/bride/guests/:id
router.put('/guests/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const existing = await db
      .select()
      .from(weddingGuests)
      .where(and(eq(weddingGuests.id, id), eq(weddingGuests.userId, userId), isNull(weddingGuests.deletedAt)));

    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Convidado não encontrado.' });

    const { name, phone, email, familyGroup, companions, tableName, sector, invitationStatus, confirmationStatus, dietaryRestrictions, notes } = req.body;

    await db
      .update(weddingGuests)
      .set({
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(familyGroup !== undefined ? { familyGroup } : {}),
        ...(companions !== undefined ? { companions: Number(companions) } : {}),
        ...(tableName !== undefined ? { tableName } : {}),
        ...(sector !== undefined ? { sector } : {}),
        ...(invitationStatus !== undefined ? { invitationStatus } : {}),
        ...(confirmationStatus !== undefined ? { confirmationStatus } : {}),
        ...(dietaryRestrictions !== undefined ? { dietaryRestrictions } : {}),
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: new Date(),
      })
      .where(eq(weddingGuests.id, id));

    const updated = await db.select().from(weddingGuests).where(eq(weddingGuests.id, id));
    return res.json({ success: true, guest: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/bride/guests/:id
router.delete('/guests/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const existing = await db
      .select()
      .from(weddingGuests)
      .where(and(eq(weddingGuests.id, id), eq(weddingGuests.userId, userId), isNull(weddingGuests.deletedAt)));

    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Convidado não encontrado.' });

    await db.update(weddingGuests).set({ deletedAt: new Date() }).where(eq(weddingGuests.id, id));
    return res.json({ success: true, message: 'Convidado removido com sucesso.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 7. GIFTS (PRESENTES)
// ============================================================================

// GET /api/bride/gifts
router.get('/gifts', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const gifts = await db
      .select()
      .from(weddingGifts)
      .where(and(eq(weddingGifts.userId, userId), isNull(weddingGifts.deletedAt)))
      .orderBy(asc(weddingGifts.name));

    return res.json({ success: true, gifts });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bride/gifts
router.post('/gifts', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const { name, description, estimatedValue, productUrl, image } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Nome do presente é obrigatório.' });

    const [insert] = await db.insert(weddingGifts).values({
      userId,
      name,
      description: description || null,
      estimatedValue: estimatedValue ? String(estimatedValue) : '0.00',
      productUrl: productUrl || null,
      image: image || null,
      isPurchased: false,
    });

    const newGift = await db.select().from(weddingGifts).where(eq(weddingGifts.id, Number(insert.insertId)));
    return res.status(201).json({ success: true, gift: newGift[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/bride/gifts/:id
router.put('/gifts/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const existing = await db
      .select()
      .from(weddingGifts)
      .where(and(eq(weddingGifts.id, id), eq(weddingGifts.userId, userId), isNull(weddingGifts.deletedAt)));

    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Presente não encontrado.' });

    const { name, description, estimatedValue, productUrl, image, isPurchased, purchasedBy, message } = req.body;

    await db
      .update(weddingGifts)
      .set({
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(estimatedValue !== undefined ? { estimatedValue: String(estimatedValue) } : {}),
        ...(productUrl !== undefined ? { productUrl } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(isPurchased !== undefined ? { isPurchased, purchasedAt: isPurchased ? new Date() : null } : {}),
        ...(purchasedBy !== undefined ? { purchasedBy } : {}),
        ...(message !== undefined ? { message } : {}),
        updatedAt: new Date(),
      })
      .where(eq(weddingGifts.id, id));

    const updated = await db.select().from(weddingGifts).where(eq(weddingGifts.id, id));
    return res.json({ success: true, gift: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/bride/gifts/:id
router.delete('/gifts/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const existing = await db
      .select()
      .from(weddingGifts)
      .where(and(eq(weddingGifts.id, id), eq(weddingGifts.userId, userId), isNull(weddingGifts.deletedAt)));

    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Presente não encontrado.' });

    await db.update(weddingGifts).set({ deletedAt: new Date() }).where(eq(weddingGifts.id, id));
    return res.json({ success: true, message: 'Presente removido com sucesso.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 8. FAVORITES (PHOTOGRAPHERS, INSPIRATIONS, LOCATIONS)
// ============================================================================

// GET /api/bride/favorites/photographers
router.get('/favorites/photographers', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const favs = await db.select().from(photographerFavorites).where(eq(photographerFavorites.userId, userId));
    return res.json({ success: true, favorites: favs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bride/favorites/photographers/:photographerId
router.post('/favorites/photographers/:photographerId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const photographerId = Number(req.params.photographerId);

    const existing = await db
      .select()
      .from(photographerFavorites)
      .where(and(eq(photographerFavorites.userId, userId), eq(photographerFavorites.photographerId, photographerId)));

    if (existing.length > 0) {
      return res.json({ success: true, favorite: existing[0], message: 'Fotógrafo já está nos favoritos.' });
    }

    const [insert] = await db.insert(photographerFavorites).values({ userId, photographerId });
    return res.status(201).json({ success: true, id: insert.insertId, photographerId });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/bride/favorites/photographers/:photographerId
router.delete('/favorites/photographers/:photographerId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const photographerId = Number(req.params.photographerId);

    await db
      .delete(photographerFavorites)
      .where(and(eq(photographerFavorites.userId, userId), eq(photographerFavorites.photographerId, photographerId)));

    return res.json({ success: true, message: 'Removido dos favoritos com sucesso.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bride/favorites/inspirations
router.get('/favorites/inspirations', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const favs = await db.select().from(inspirationFavorites).where(eq(inspirationFavorites.userId, userId));
    return res.json({ success: true, favorites: favs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bride/favorites/inspirations
router.post('/favorites/inspirations', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const { inspirationId, title, category, imageUrl } = req.body;

    if (!inspirationId) return res.status(400).json({ success: false, error: 'ID da inspiração é obrigatório.' });

    const existing = await db
      .select()
      .from(inspirationFavorites)
      .where(and(eq(inspirationFavorites.userId, userId), eq(inspirationFavorites.inspirationId, String(inspirationId))));

    if (existing.length > 0) {
      return res.json({ success: true, favorite: existing[0], message: 'Inspiração já está nos favoritos.' });
    }

    const [insert] = await db.insert(inspirationFavorites).values({
      userId,
      inspirationId: String(inspirationId),
      title: title || null,
      category: category || null,
      imageUrl: imageUrl || null,
    });

    return res.status(201).json({ success: true, id: insert.insertId, inspirationId });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/bride/favorites/inspirations/:inspirationId
router.delete('/favorites/inspirations/:inspirationId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const inspirationId = String(req.params.inspirationId);

    await db
      .delete(inspirationFavorites)
      .where(and(eq(inspirationFavorites.userId, userId), eq(inspirationFavorites.inspirationId, inspirationId)));

    return res.json({ success: true, message: 'Inspiração removida dos favoritos.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 9. TIMELINE (CRONOGRAMA DO DIA)
// ============================================================================

// GET /api/bride/timeline
router.get('/timeline', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    let timelines = await db.select().from(weddingTimelines).where(eq(weddingTimelines.userId, userId));
    let timeline = timelines[0];

    if (!timeline) {
      const [tInsert] = await db.insert(weddingTimelines).values({
        userId,
        title: 'Cronograma do Dia do Casamento',
      });
      const newT = await db.select().from(weddingTimelines).where(eq(weddingTimelines.id, Number(tInsert.insertId)));
      timeline = newT[0];
    }

    const items = await db
      .select()
      .from(weddingTimelineItems)
      .where(eq(weddingTimelineItems.timelineId, timeline.id))
      .orderBy(asc(weddingTimelineItems.sortOrder), asc(weddingTimelineItems.time));

    return res.json({ success: true, timeline, items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bride/timeline/item
router.post('/timeline/item', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const { time, title, description, responsible, location } = req.body;

    if (!time || !title) return res.status(400).json({ success: false, error: 'Horário e título são obrigatórios.' });

    let timelines = await db.select().from(weddingTimelines).where(eq(weddingTimelines.userId, userId));
    let timelineId = timelines[0]?.id;

    if (!timelineId) {
      const [tInsert] = await db.insert(weddingTimelines).values({ userId, title: 'Cronograma do Dia do Casamento' });
      timelineId = Number(tInsert.insertId);
    }

    const [insert] = await db.insert(weddingTimelineItems).values({
      timelineId,
      time,
      title,
      description: description || null,
      responsible: responsible || null,
      location: location || null,
    });

    const newItem = await db.select().from(weddingTimelineItems).where(eq(weddingTimelineItems.id, Number(insert.insertId)));
    return res.status(201).json({ success: true, item: newItem[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/bride/timeline/item/:id
router.put('/timeline/item/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    // Verify item belongs to user's timeline
    let timelines = await db.select().from(weddingTimelines).where(eq(weddingTimelines.userId, userId));
    if (timelines.length === 0) return res.status(404).json({ success: false, error: 'Cronograma não encontrado.' });

    const timelineId = timelines[0].id;
    const items = await db.select().from(weddingTimelineItems).where(and(eq(weddingTimelineItems.id, id), eq(weddingTimelineItems.timelineId, timelineId)));

    if (items.length === 0) return res.status(404).json({ success: false, error: 'Item do cronograma não encontrado.' });

    const { time, title, description, responsible, location, sortOrder } = req.body;

    await db
      .update(weddingTimelineItems)
      .set({
        ...(time !== undefined ? { time } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(responsible !== undefined ? { responsible } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(weddingTimelineItems.id, id));

    const updated = await db.select().from(weddingTimelineItems).where(eq(weddingTimelineItems.id, id));
    return res.json({ success: true, item: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/bride/timeline/item/:id
router.delete('/timeline/item/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    let timelines = await db.select().from(weddingTimelines).where(eq(weddingTimelines.userId, userId));
    if (timelines.length === 0) return res.status(404).json({ success: false, error: 'Cronograma não encontrado.' });

    const timelineId = timelines[0].id;
    const items = await db.select().from(weddingTimelineItems).where(and(eq(weddingTimelineItems.id, id), eq(weddingTimelineItems.timelineId, timelineId)));

    if (items.length === 0) return res.status(404).json({ success: false, error: 'Item não encontrado.' });

    await db.delete(weddingTimelineItems).where(eq(weddingTimelineItems.id, id));
    return res.json({ success: true, message: 'Item removido do cronograma.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 10. WEDDING WEBSITE & RSVPs (SITE DO CASAL)
// ============================================================================

// GET /api/bride/wedding-website
router.get('/wedding-website', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    let sites = await db.select().from(weddingWebsites).where(eq(weddingWebsites.userId, userId));
    let site = sites[0] || null;

    let rsvps: any[] = [];
    if (site) {
      rsvps = await db.select().from(weddingRsvps).where(eq(weddingRsvps.weddingWebsiteId, site.id)).orderBy(desc(weddingRsvps.createdAt));
    }

    return res.json({ success: true, website: site, rsvps });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST/PUT /api/bride/wedding-website
router.post('/wedding-website', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const { slug, coupleNames, headline, story, weddingDate, ceremonyLocation, receptionLocation, coverImage, theme, primaryColor, isPublished, rsvpEnabled } = req.body;

    if (!coupleNames) return res.status(400).json({ success: false, error: 'Nome do casal é obrigatório.' });

    const cleanSlug = (slug || coupleNames)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existingSites = await db.select().from(weddingWebsites).where(eq(weddingWebsites.userId, userId));

    if (existingSites.length === 0) {
      // Create site
      const [insert] = await db.insert(weddingWebsites).values({
        userId,
        slug: cleanSlug,
        coupleNames,
        headline: headline || 'Sejam bem-vindos ao nosso site de casamento!',
        story: story || null,
        weddingDate: weddingDate || null,
        ceremonyLocation: ceremonyLocation || null,
        receptionLocation: receptionLocation || null,
        coverImage: coverImage || null,
        theme: theme || 'Romantic Rose',
        primaryColor: primaryColor || '#C88E9B',
        isPublished: isPublished !== undefined ? isPublished : true,
        rsvpEnabled: rsvpEnabled !== undefined ? rsvpEnabled : true,
      });

      const newSite = await db.select().from(weddingWebsites).where(eq(weddingWebsites.id, Number(insert.insertId)));
      return res.status(201).json({ success: true, website: newSite[0] });
    } else {
      // Update existing site
      const siteId = existingSites[0].id;
      await db
        .update(weddingWebsites)
        .set({
          ...(slug ? { slug: cleanSlug } : {}),
          ...(coupleNames !== undefined ? { coupleNames } : {}),
          ...(headline !== undefined ? { headline } : {}),
          ...(story !== undefined ? { story } : {}),
          ...(weddingDate !== undefined ? { weddingDate } : {}),
          ...(ceremonyLocation !== undefined ? { ceremonyLocation } : {}),
          ...(receptionLocation !== undefined ? { receptionLocation } : {}),
          ...(coverImage !== undefined ? { coverImage } : {}),
          ...(theme !== undefined ? { theme } : {}),
          ...(primaryColor !== undefined ? { primaryColor } : {}),
          ...(isPublished !== undefined ? { isPublished } : {}),
          ...(rsvpEnabled !== undefined ? { rsvpEnabled } : {}),
          updatedAt: new Date(),
        })
        .where(eq(weddingWebsites.id, siteId));

      const updatedSite = await db.select().from(weddingWebsites).where(eq(weddingWebsites.id, siteId));
      return res.json({ success: true, website: updatedSite[0] });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 11. QUIZ & ACHIEVEMENTS & LGPD
// ============================================================================

// GET /api/bride/quiz
router.get('/quiz', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const results = await db.select().from(weddingStyleQuizResults).where(eq(weddingStyleQuizResults.userId, userId));
    return res.json({ success: true, quizResult: results[0] || null });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bride/quiz
router.post('/quiz', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const { answersJson, resultStyle, scoreJson } = req.body;

    const existing = await db.select().from(weddingStyleQuizResults).where(eq(weddingStyleQuizResults.userId, userId));

    if (existing.length === 0) {
      await db.insert(weddingStyleQuizResults).values({
        userId,
        answersJson: answersJson || {},
        resultStyle: resultStyle || 'Clássico / Elegante',
        scoreJson: scoreJson || {},
      });
    } else {
      await db
        .update(weddingStyleQuizResults)
        .set({
          answersJson: answersJson || {},
          resultStyle: resultStyle || 'Clássico / Elegante',
          scoreJson: scoreJson || {},
          updatedAt: new Date(),
        })
        .where(eq(weddingStyleQuizResults.userId, userId));
    }

    // Update wedding style in couple profile too
    await db
      .update(coupleProfiles)
      .set({ weddingStyle: resultStyle, updatedAt: new Date() })
      .where(eq(coupleProfiles.userId, userId));

    const updated = await db.select().from(weddingStyleQuizResults).where(eq(weddingStyleQuizResults.userId, userId));
    return res.json({ success: true, quizResult: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bride/achievements
router.get('/achievements', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);
    const allAchs = await db.select().from(achievements);
    const userAchs = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));

    const unlockedIds = new Set(userAchs.map((ua) => ua.achievementId));

    const list = allAchs.map((a) => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
      unlockedAt: userAchs.find((ua) => ua.achievementId === a.id)?.unlockedAt || null,
    }));

    return res.json({ success: true, achievements: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/bride/account (LGPD Account Deletion)
router.delete('/account', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req);

    // Soft delete user and remove personal data
    await db
      .update(users)
      .set({
        name: 'Usuário Excluído',
        phone: null,
        avatar: null,
        status: 'deleted',
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Clear couple profile
    await db.delete(coupleProfiles).where(eq(coupleProfiles.userId, userId));

    res.clearCookie('auth_token');
    res.clearCookie('token');

    return res.json({
      success: true,
      message: 'Sua conta e seus dados foram excluídos com sucesso em conformidade com a LGPD.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
