import { eq, and, isNull, lte, inArray, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  subscriptionPlans,
  subscriptionPlanFeatures,
  photographerSubscriptions,
  subscriptionPayments,
  subscriptionHistory,
  photographerPlanPeriods,
  photographers,
} from '../db/schema.ts';

export interface PhotographerPermissions {
  [key: string]: boolean | number | string | null;
  gallery_photos_limit: number | null; // null or -1 = unlimited
  service_cities_limit: number | null;
  categories_limit: number | null;
  monthly_leads_limit: number | null;
  verified_badge: boolean;
  premium_badge: boolean;
  whatsapp_direct: boolean;
  search_priority: boolean;
  crm_access: boolean;
  fixed_home_position: boolean;
  real_weddings_publication: boolean;
  vip_support: boolean;
  click_reports: boolean;
}

export interface EffectivePlanResult {
  plan: any;
  subscription: any | null;
  permissions: PhotographerPermissions;
  isFree: boolean;
  effectiveStatus: string;
}

export class SubscriptionService {
  private static isExpiringJobRunning = false;

  /**
   * Helper to fetch default FREE plan if photographer has no active paid subscription
   */
  static async getDefaultFreePlan() {
    let freePlans = await db
      .select()
      .from(subscriptionPlans)
      .where(
        and(
          eq(subscriptionPlans.isDefaultFreePlan, true),
          eq(subscriptionPlans.status, 'active'),
          isNull(subscriptionPlans.deletedAt)
        )
      );

    if (freePlans.length === 0) {
      freePlans = await db
        .select()
        .from(subscriptionPlans)
        .where(
          and(
            eq(subscriptionPlans.planType, 'FREE'),
            eq(subscriptionPlans.status, 'active'),
            isNull(subscriptionPlans.deletedAt)
          )
        );
    }

    if (freePlans.length === 0) {
      freePlans = await db
        .select()
        .from(subscriptionPlans)
        .where(
          and(
            eq(subscriptionPlans.isFree, true),
            eq(subscriptionPlans.status, 'active'),
            isNull(subscriptionPlans.deletedAt)
          )
        );
    }

    return freePlans[0] || null;
  }

  /**
   * Main permission resolver: getEffectivePlan
   * Evaluates photographer active subscription dynamically and merges plan features.
   * Maintains photographer media, cities, and profile data intact even when subscription expires.
   */
  static async getEffectivePlan(photographerId: number): Promise<EffectivePlanResult> {
    // 1. First trigger background auto-expiration check
    await this.checkAndExpireSubscriptions();

    // 2. Fetch active/valid photographer subscription
    const activeSubs = await db
      .select()
      .from(photographerSubscriptions)
      .where(
        and(
          eq(photographerSubscriptions.photographerId, photographerId),
          inArray(photographerSubscriptions.status, ['ACTIVE', 'CANCEL_SCHEDULED', 'PAST_DUE', 'SUSPENDED'])
        )
      )
      .orderBy(desc(photographerSubscriptions.id));

    const now = new Date();
    let currentSub = activeSubs[0] || null;

    // Validate period end if exists (CANCEL_SCHEDULED remains active until periodEnd)
    if (currentSub && currentSub.currentPeriodEnd) {
      const periodEnd = new Date(currentSub.currentPeriodEnd);
      if (periodEnd < now && currentSub.status !== 'SUSPENDED') {
        currentSub = null; // Expired
      }
    }

    let targetPlan: any = null;

    if (currentSub && currentSub.planId) {
      const planRes = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, currentSub.planId));
      if (planRes.length > 0) {
        targetPlan = planRes[0];
      }
    }

    // Fallback to default free plan if no active subscription
    if (!targetPlan) {
      targetPlan = await this.getDefaultFreePlan();
      currentSub = null;
    }

    // Extract features for permissions
    const defaultPermissions: PhotographerPermissions = {
      gallery_photos_limit: targetPlan?.isFree ? 10 : -1,
      service_cities_limit: targetPlan?.isFree ? 1 : -1,
      categories_limit: targetPlan?.isFree ? 1 : -1,
      monthly_leads_limit: targetPlan?.isFree ? 5 : -1,
      verified_badge: !targetPlan?.isFree,
      premium_badge: Boolean(targetPlan?.isPremium),
      whatsapp_direct: !targetPlan?.isFree,
      search_priority: !targetPlan?.isFree,
      crm_access: true,
      fixed_home_position: Boolean(targetPlan?.isPremium),
      real_weddings_publication: Boolean(targetPlan?.isPremium),
      vip_support: Boolean(targetPlan?.isPremium),
      click_reports: Boolean(targetPlan?.isPremium),
    };

    if (targetPlan) {
      const features = await db
        .select()
        .from(subscriptionPlanFeatures)
        .where(eq(subscriptionPlanFeatures.planId, targetPlan.id));

      features.forEach((feat) => {
        if (feat.featureKey) {
          if (feat.isUnlimited) {
            defaultPermissions[feat.featureKey] = -1;
          } else if (feat.featureType === 'numeric' && feat.numericValue !== null) {
            defaultPermissions[feat.featureKey] = feat.numericValue;
          } else if (feat.featureType === 'boolean') {
            defaultPermissions[feat.featureKey] = Boolean(feat.booleanValue);
          } else if (feat.textValue !== null) {
            defaultPermissions[feat.featureKey] = feat.textValue;
          }
        }
      });
    }

    return {
      plan: targetPlan,
      subscription: currentSub,
      permissions: defaultPermissions,
      isFree: Boolean(!currentSub || targetPlan?.isFree),
      effectiveStatus: currentSub ? currentSub.status : 'ACTIVE',
    };
  }

  /**
   * Simulate a Payment transaction (Approved, Pending, Rejected, Refunded) with IDEMPOTENCY
   */
  static async simulatePayment(params: {
    photographerId: number;
    planId: number;
    billingCycle: 'MONTHLY' | 'YEARLY';
    simulationOutcome: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REFUNDED';
    paymentMethod?: string;
    installments?: number;
    adminId?: number | string;
    externalPaymentId?: string;
    simulationEventId?: string;
  }) {
    const {
      photographerId,
      planId,
      billingCycle,
      simulationOutcome,
      paymentMethod = 'SIMULATION',
      installments = 1,
      adminId,
      externalPaymentId,
      simulationEventId,
    } = params;
    const numericAdminId = adminId ? (isNaN(Number(adminId)) ? null : Number(adminId)) : null;

    // Verify Photographer
    const pRes = await db.select().from(photographers).where(eq(photographers.id, photographerId));
    if (pRes.length === 0) {
      throw new Error('Fotógrafo não encontrado.');
    }

    // Verify Plan
    const planRes = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId));
    if (planRes.length === 0) {
      throw new Error('Plano de assinatura não encontrado.');
    }
    const plan = planRes[0];

    // Idempotency check: verify if this payment or simulation event was already processed
    const idempotencyKey = simulationEventId || externalPaymentId;
    if (idempotencyKey) {
      const existingPayment = await db
        .select()
        .from(subscriptionPayments)
        .where(
          and(
            eq(subscriptionPayments.photographerId, photographerId),
            eq(subscriptionPayments.status, 'APPROVED'),
            sql`(${subscriptionPayments.externalPaymentId} = ${idempotencyKey} OR ${subscriptionPayments.simulationEventId} = ${idempotencyKey})`
          )
        );

      if (existingPayment.length > 0) {
        return {
          success: true,
          idempotent: true,
          message: 'Este pagamento já foi processado anteriormente (Sucesso Idempotente). Nenhuma ação duplicada foi gerada.',
          paymentId: existingPayment[0].id,
          subscriptionId: existingPayment[0].subscriptionId,
        };
      }
    }

    // Always fetch official prices from database
    const priceStr = billingCycle === 'YEARLY' ? plan.annualPrice : plan.monthlyPrice;
    const amount = parseFloat(priceStr || '0.00');

    const extPaymentId = externalPaymentId || `SIM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const payRef = `REF-${Date.now()}`;
    const now = new Date();

    if (simulationOutcome === 'APPROVED') {
      let startDate = now;
      const existingSubs = await db
        .select()
        .from(photographerSubscriptions)
        .where(
          and(
            eq(photographerSubscriptions.photographerId, photographerId),
            inArray(photographerSubscriptions.status, ['ACTIVE', 'CANCEL_SCHEDULED'])
          )
        );

      const existingSub = existingSubs[0];
      if (existingSub && existingSub.planId === planId && existingSub.currentPeriodEnd) {
        const pEnd = new Date(existingSub.currentPeriodEnd);
        if (pEnd > now) {
          startDate = pEnd; // Extend from current end date
        }
      }

      const endDate = new Date(startDate);
      if (billingCycle === 'YEARLY') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      let subId: number;

      if (existingSub) {
        await db
          .update(photographerSubscriptions)
          .set({
            planId,
            billingCycle,
            status: 'ACTIVE',
            source: 'SIMULATION',
            isComplimentary: false,
            countsAsRevenue: true,
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
            nextBillingAt: endDate,
            cancelAtPeriodEnd: false,
            updatedAt: now,
          })
          .where(eq(photographerSubscriptions.id, existingSub.id));
        subId = existingSub.id;
      } else {
        const [insertSub] = await db.insert(photographerSubscriptions).values({
          photographerId,
          planId,
          billingCycle,
          status: 'ACTIVE',
          source: 'SIMULATION',
          isComplimentary: false,
          countsAsRevenue: true,
          startsAt: startDate,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          nextBillingAt: endDate,
          cancelAtPeriodEnd: false,
          createdByAdminId: numericAdminId,
        });
        subId = (insertSub as any).insertId;
      }

      await db.insert(subscriptionPayments).values({
        subscriptionId: subId,
        photographerId,
        planId,
        billingCycle,
        provider: 'SIMULATION',
        externalPaymentId: extPaymentId,
        simulationEventId: simulationEventId || extPaymentId,
        paymentReference: payRef,
        amount: amount.toFixed(2),
        currency: 'BRL',
        status: 'APPROVED',
        paymentMethod,
        installments,
        paidAt: now,
        createdByAdminId: numericAdminId,
      });

      await db.update(photographers).set({ plan: plan.name }).where(eq(photographers.id, photographerId));

      await db.insert(subscriptionHistory).values({
        subscriptionId: subId,
        photographerId,
        newPlanId: planId,
        newStatus: 'ACTIVE',
        newBillingCycle: billingCycle,
        eventType: 'PAYMENT_APPROVED',
        performedByType: numericAdminId ? 'ADMIN' : 'PHOTOGRAPHER',
        performedUserId: numericAdminId || photographerId,
        reason: `Simulação de pagamento aprovado (${billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'}) - R$ ${amount.toFixed(2)}`,
        detailsJson: { amount, externalPaymentId: extPaymentId, paymentReference: payRef },
      });

      return {
        success: true,
        subscriptionId: subId,
        message: `Pagamento aprovado com sucesso! Plano ${plan.name} (${billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'}) ativado até ${endDate.toLocaleDateString('pt-BR')}.`,
      };
    }

    if (simulationOutcome === 'PENDING') {
      const [insertSub] = await db.insert(photographerSubscriptions).values({
        photographerId,
        planId,
        billingCycle,
        status: 'PENDING',
        source: 'SIMULATION',
        startsAt: now,
        createdByAdminId: numericAdminId,
      });
      const subId = (insertSub as any).insertId;

      await db.insert(subscriptionPayments).values({
        subscriptionId: subId,
        photographerId,
        planId,
        billingCycle,
        provider: 'SIMULATION',
        externalPaymentId: extPaymentId,
        simulationEventId: simulationEventId || extPaymentId,
        paymentReference: payRef,
        amount: amount.toFixed(2),
        currency: 'BRL',
        status: 'PENDING',
        paymentMethod,
        installments,
        createdByAdminId: numericAdminId,
      });

      await db.insert(subscriptionHistory).values({
        subscriptionId: subId,
        photographerId,
        newPlanId: planId,
        newStatus: 'PENDING',
        newBillingCycle: billingCycle,
        eventType: 'CREATED',
        performedByType: numericAdminId ? 'ADMIN' : 'PHOTOGRAPHER',
        performedUserId: numericAdminId || photographerId,
        reason: 'Simulação de pagamento pendente.',
      });

      return {
        success: true,
        subscriptionId: subId,
        message: 'Aguardando confirmação do pagamento. O plano não foi alterado.',
      };
    }

    if (simulationOutcome === 'REJECTED') {
      await db.insert(subscriptionPayments).values({
        photographerId,
        planId,
        billingCycle,
        provider: 'SIMULATION',
        externalPaymentId: extPaymentId,
        simulationEventId: simulationEventId || extPaymentId,
        paymentReference: payRef,
        amount: amount.toFixed(2),
        currency: 'BRL',
        status: 'REJECTED',
        paymentMethod,
        installments,
        failedAt: now,
        failureReason: 'Cartão/Transação recusada na simulação.',
        createdByAdminId: numericAdminId,
      });

      await db.insert(subscriptionHistory).values({
        photographerId,
        newPlanId: planId,
        eventType: 'PAYMENT_REJECTED',
        performedByType: numericAdminId ? 'ADMIN' : 'PHOTOGRAPHER',
        performedUserId: numericAdminId || photographerId,
        reason: 'Simulação de pagamento recusado.',
      });

      return {
        success: false,
        message: 'Pagamento recusado na simulação. O plano do fotógrafo permaneceu inalterado.',
      };
    }

    if (simulationOutcome === 'REFUNDED') {
      return this.adminRefundPayment({
        photographerId,
        planId,
        amount,
        paymentMethod,
        adminId: numericAdminId,
      });
    }

    throw new Error('Resultado de simulação inválido.');
  }

  /**
   * Request Subscription Cancellation at period end
   */
  static async requestCancellation(photographerId: number, reason?: string) {
    const subs = await db
      .select()
      .from(photographerSubscriptions)
      .where(
        and(
          eq(photographerSubscriptions.photographerId, photographerId),
          eq(photographerSubscriptions.status, 'ACTIVE')
        )
      );

    if (subs.length === 0) {
      throw new Error('Nenhuma assinatura ativa encontrada para cancelamento.');
    }

    const sub = subs[0];
    const now = new Date();

    await db
      .update(photographerSubscriptions)
      .set({
        cancelAtPeriodEnd: true,
        cancelRequestedAt: now,
        status: 'CANCEL_SCHEDULED',
      })
      .where(eq(photographerSubscriptions.id, sub.id));

    await db.insert(subscriptionHistory).values({
      subscriptionId: sub.id,
      photographerId,
      previousStatus: 'ACTIVE',
      newStatus: 'CANCEL_SCHEDULED',
      eventType: 'CANCELLATION_REQUESTED',
      performedByType: 'PHOTOGRAPHER',
      performedUserId: photographerId,
      reason: reason || 'Cancelamento solicitado pelo fotógrafo.',
    });

    return {
      success: true,
      currentPeriodEnd: sub.currentPeriodEnd,
      message: `Sua assinatura continuará ativa até ${sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR') : 'o fim do período'}. Após essa data, sua conta retornará ao Plano Gratuito.`,
    };
  }

  /**
   * Revoke pending cancellation and keep active subscription
   */
  static async reactivateCancellation(photographerId: number) {
    const subs = await db
      .select()
      .from(photographerSubscriptions)
      .where(
        and(
          eq(photographerSubscriptions.photographerId, photographerId),
          eq(photographerSubscriptions.status, 'CANCEL_SCHEDULED')
        )
      );

    if (subs.length === 0) {
      throw new Error('Nenhum cancelamento agendado encontrado.');
    }

    const sub = subs[0];

    await db
      .update(photographerSubscriptions)
      .set({
        cancelAtPeriodEnd: false,
        status: 'ACTIVE',
      })
      .where(eq(photographerSubscriptions.id, sub.id));

    await db.insert(subscriptionHistory).values({
      subscriptionId: sub.id,
      photographerId,
      previousStatus: 'CANCEL_SCHEDULED',
      newStatus: 'ACTIVE',
      eventType: 'CANCELLATION_REVOKED',
      performedByType: 'PHOTOGRAPHER',
      performedUserId: photographerId,
      reason: 'Cancelamento revogado pelo fotógrafo.',
    });

    return {
      success: true,
      message: 'Assinatura mantida e renovação automática reativada com sucesso!',
    };
  }

  /**
   * Background process to expire subscriptions past currentPeriodEnd and apply scheduled plan changes.
   * Uses thread lock guard to prevent concurrent execution race conditions.
   */
  static async checkAndExpireSubscriptions() {
    if (this.isExpiringJobRunning) return;
    this.isExpiringJobRunning = true;

    try {
      const now = new Date();
      const expiredSubs = await db
        .select()
        .from(photographerSubscriptions)
        .where(
          and(
            inArray(photographerSubscriptions.status, ['ACTIVE', 'CANCEL_SCHEDULED', 'PAST_DUE']),
            lte(photographerSubscriptions.currentPeriodEnd, now)
          )
        );

      for (const sub of expiredSubs) {
        if (sub.scheduledPlanId) {
          const nextPlanRes = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, sub.scheduledPlanId));
          if (nextPlanRes.length > 0) {
            const nextPlan = nextPlanRes[0];
            const cycle = sub.scheduledBillingCycle || sub.billingCycle || 'MONTHLY';
            const startDate = now;
            const endDate = new Date(startDate);
            if (cycle === 'YEARLY') endDate.setFullYear(endDate.getFullYear() + 1);
            else endDate.setMonth(endDate.getMonth() + 1);

            await db
              .update(photographerSubscriptions)
              .set({
                planId: nextPlan.id,
                billingCycle: cycle,
                status: 'ACTIVE',
                currentPeriodStart: startDate,
                currentPeriodEnd: endDate,
                nextBillingAt: endDate,
                scheduledPlanId: null,
                scheduledBillingCycle: null,
                scheduledChangeAt: null,
              })
              .where(eq(photographerSubscriptions.id, sub.id));

            await db.update(photographers).set({ plan: nextPlan.name }).where(eq(photographers.id, sub.photographerId));

            await db.insert(subscriptionHistory).values({
              subscriptionId: sub.id,
              photographerId: sub.photographerId,
              previousPlanId: sub.planId || undefined,
              newPlanId: nextPlan.id,
              previousStatus: sub.status,
              newStatus: 'ACTIVE',
              eventType: 'SCHEDULED_PLAN_APPLIED',
              performedByType: 'SYSTEM',
              reason: `Troca agendada de plano aplicada com sucesso para ${nextPlan.name} (${cycle}).`,
            });
            continue;
          }
        }

        const newStatus = sub.cancelAtPeriodEnd ? 'CANCELLED' : 'EXPIRED';

        await db
          .update(photographerSubscriptions)
          .set({
            status: newStatus,
            cancelledAt: newStatus === 'CANCELLED' ? now : undefined,
            expiredAt: newStatus === 'EXPIRED' ? now : undefined,
          })
          .where(eq(photographerSubscriptions.id, sub.id));

        const defaultFree = await this.getDefaultFreePlan();
        if (defaultFree) {
          await db
            .update(photographers)
            .set({ plan: defaultFree.name })
            .where(eq(photographers.id, sub.photographerId));
        }

        await db.insert(subscriptionHistory).values({
          subscriptionId: sub.id,
          photographerId: sub.photographerId,
          previousStatus: sub.status,
          newStatus,
          eventType: newStatus === 'CANCELLED' ? 'CANCELLED' : 'EXPIRED',
          performedByType: 'SYSTEM',
          reason: 'Período da assinatura encerrado.',
        });

        await db.insert(subscriptionHistory).values({
          subscriptionId: sub.id,
          photographerId: sub.photographerId,
          eventType: 'RETURNED_TO_FREE',
          performedByType: 'SYSTEM',
          reason: 'Conta retornou automaticamente ao Plano Gratuito. Todos os dados (fotos, cidades, propostas) foram preservados.',
        });
      }
    } catch (err) {
      console.error('Error auto-expiring subscriptions:', err);
    } finally {
      this.isExpiringJobRunning = false;
    }
  }

  /**
   * Admin: Manual activation with Courtesy support
   */
  static async adminManualActivation(params: {
    photographerId: number;
    planId: number;
    billingCycle: 'MONTHLY' | 'YEARLY' | 'MANUAL';
    startsAt?: string;
    endsAt?: string;
    amount?: number;
    notes?: string;
    isComplimentary?: boolean;
    adminId?: number | string;
  }) {
    const { photographerId, planId, billingCycle, startsAt, endsAt, amount = 0, notes, isComplimentary = false, adminId } = params;
    const numericAdminId = adminId ? (isNaN(Number(adminId)) ? null : Number(adminId)) : null;

    const planRes = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId));
    if (planRes.length === 0) throw new Error('Plano não encontrado.');
    const plan = planRes[0];

    const startDate = startsAt ? new Date(startsAt) : new Date();
    let endDate: Date;
    if (endsAt) {
      endDate = new Date(endsAt);
    } else {
      endDate = new Date(startDate);
      if (billingCycle === 'YEARLY') endDate.setFullYear(endDate.getFullYear() + 1);
      else endDate.setMonth(endDate.getMonth() + 1);
    }

    const countsAsRevenue = isComplimentary ? false : (amount > 0);

    const [insertSub] = await db.insert(photographerSubscriptions).values({
      photographerId,
      planId,
      billingCycle,
      status: 'ACTIVE',
      source: 'MANUAL',
      isComplimentary,
      countsAsRevenue,
      complimentaryReason: isComplimentary ? (notes || 'Ativação cortesia / parceria') : null,
      complimentaryApprovedBy: isComplimentary ? numericAdminId : null,
      startsAt: startDate,
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
      nextBillingAt: endDate,
      cancelAtPeriodEnd: false,
      createdByAdminId: numericAdminId,
      adminNotes: notes || null,
    });

    const subId = (insertSub as any).insertId;

    await db.insert(subscriptionPayments).values({
      subscriptionId: subId,
      photographerId,
      planId,
      billingCycle,
      provider: 'MANUAL',
      externalPaymentId: `MANUAL-${Date.now()}`,
      amount: amount.toFixed(2),
      currency: 'BRL',
      status: 'APPROVED',
      paymentMethod: 'MANUAL',
      paidAt: startDate,
      createdByAdminId: numericAdminId,
    });

    await db.update(photographers).set({ plan: plan.name }).where(eq(photographers.id, photographerId));

    await db.insert(subscriptionHistory).values({
      subscriptionId: subId,
      photographerId,
      newPlanId: planId,
      newStatus: 'ACTIVE',
      newBillingCycle: billingCycle,
      eventType: isComplimentary ? 'COURTESY_GRANTED' : 'ACTIVATED',
      performedByType: 'ADMIN',
      performedUserId: numericAdminId,
      reason: notes || (isComplimentary ? 'Concessão de Cortesia pelo Administrador' : 'Ativação manual efetuada pelo Administrador.'),
    });

    return {
      success: true,
      subscriptionId: subId,
      message: isComplimentary
        ? 'Cortesia ativada com sucesso! Não gera receita computada no MRR.'
        : 'Assinatura ativada manualmente com sucesso!',
    };
  }

  /**
   * Admin: Suspend subscription with timestamp precision
   */
  static async adminSuspendSubscription(subscriptionId: number, reason: string, adminId?: number | string) {
    const numericAdminId = adminId ? (isNaN(Number(adminId)) ? null : Number(adminId)) : null;
    const subRes = await db.select().from(photographerSubscriptions).where(eq(photographerSubscriptions.id, subscriptionId));
    if (subRes.length === 0) throw new Error('Assinatura não encontrada.');
    const sub = subRes[0];

    const now = new Date();
    await db
      .update(photographerSubscriptions)
      .set({
        status: 'SUSPENDED',
        suspendedAt: now,
      })
      .where(eq(photographerSubscriptions.id, subscriptionId));

    await db.insert(subscriptionHistory).values({
      subscriptionId,
      photographerId: sub.photographerId,
      previousStatus: sub.status,
      newStatus: 'SUSPENDED',
      eventType: 'SUSPENDED',
      performedByType: 'ADMIN',
      performedUserId: numericAdminId,
      reason,
    });

    return { success: true, message: 'Assinatura suspensa com sucesso.' };
  }

  /**
   * Admin: Reactivate suspended subscription with EXACT time compensation (seconds level precision)
   */
  static async adminReactivateSubscription(subscriptionId: number, compensateDays: boolean, reason: string, adminId?: number | string) {
    const numericAdminId = adminId ? (isNaN(Number(adminId)) ? null : Number(adminId)) : null;
    const subRes = await db.select().from(photographerSubscriptions).where(eq(photographerSubscriptions.id, subscriptionId));
    if (subRes.length === 0) throw new Error('Assinatura não encontrada.');
    const sub = subRes[0];

    const now = new Date();
    let newPeriodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : now;
    let addedSeconds = 0;

    if (compensateDays && sub.suspendedAt) {
      const suspendedDate = new Date(sub.suspendedAt);
      const diffMs = now.getTime() - suspendedDate.getTime();
      addedSeconds = Math.max(0, Math.floor(diffMs / 1000));
      if (addedSeconds > 0) {
        newPeriodEnd = new Date(newPeriodEnd.getTime() + diffMs);
      }
    }

    const totalSuspendedSec = (sub.totalSuspendedSeconds || 0) + addedSeconds;

    await db
      .update(photographerSubscriptions)
      .set({
        status: 'ACTIVE',
        reactivatedAt: now,
        suspendedAt: null,
        totalSuspendedSeconds: totalSuspendedSec,
        currentPeriodEnd: newPeriodEnd,
        nextBillingAt: newPeriodEnd,
      })
      .where(eq(photographerSubscriptions.id, subscriptionId));

    await db.insert(subscriptionHistory).values({
      subscriptionId,
      photographerId: sub.photographerId,
      previousStatus: sub.status,
      newStatus: 'ACTIVE',
      eventType: 'REACTIVATED',
      performedByType: 'ADMIN',
      performedUserId: numericAdminId,
      reason: reason || `Assinatura reativada pelo Administrador. Compensação: ${Math.round(addedSeconds / 3600)} horas.`,
    });

    return { success: true, message: 'Assinatura reativada com sucesso.' };
  }

  /**
   * Admin: Cancel subscription immediately or at period end
   */
  static async adminCancelSubscription(subscriptionId: number, cancelImmediately: boolean, reason: string, adminId?: number | string) {
    const numericAdminId = adminId ? (isNaN(Number(adminId)) ? null : Number(adminId)) : null;
    const subRes = await db.select().from(photographerSubscriptions).where(eq(photographerSubscriptions.id, subscriptionId));
    if (subRes.length === 0) throw new Error('Assinatura não encontrada.');
    const sub = subRes[0];

    const now = new Date();
    if (cancelImmediately) {
      await db
        .update(photographerSubscriptions)
        .set({
          status: 'CANCELLED',
          cancelledAt: now,
        })
        .where(eq(photographerSubscriptions.id, subscriptionId));

      const defaultFree = await this.getDefaultFreePlan();
      if (defaultFree) {
        await db
          .update(photographers)
          .set({ plan: defaultFree.name })
          .where(eq(photographers.id, sub.photographerId));
      }

      await db.insert(subscriptionHistory).values({
        subscriptionId,
        photographerId: sub.photographerId,
        previousStatus: sub.status,
        newStatus: 'CANCELLED',
        eventType: 'CANCELLED',
        performedByType: 'ADMIN',
        performedUserId: numericAdminId,
        reason: reason || 'Cancelamento imediato pelo Administrador.',
      });
    } else {
      await db
        .update(photographerSubscriptions)
        .set({
          cancelAtPeriodEnd: true,
          cancelRequestedAt: now,
          status: 'CANCEL_SCHEDULED',
        })
        .where(eq(photographerSubscriptions.id, subscriptionId));

      await db.insert(subscriptionHistory).values({
        subscriptionId,
        photographerId: sub.photographerId,
        previousStatus: sub.status,
        newStatus: 'CANCEL_SCHEDULED',
        eventType: 'CANCELLATION_REQUESTED',
        performedByType: 'ADMIN',
        performedUserId: numericAdminId,
        reason: reason || 'Cancelamento ao fim do período agendado pelo Administrador.',
      });
    }

    return { success: true, message: cancelImmediately ? 'Assinatura cancelada imediatamente.' : 'Cancelamento agendado para o fim do período.' };
  }

  /**
   * Refund Payment (Full or Partial)
   */
  static async adminRefundPayment(params: {
    photographerId: number;
    planId?: number;
    amount?: number;
    paymentId?: number;
    paymentMethod?: string;
    isPartial?: boolean;
    cancelSub?: boolean;
    adminId?: number | string;
  }) {
    const { photographerId, planId, amount = 0, paymentId, paymentMethod = 'SIMULATION', isPartial = false, cancelSub = true, adminId } = params;
    const numericAdminId = adminId ? (isNaN(Number(adminId)) ? null : Number(adminId)) : null;
    const now = new Date();

    if (paymentId) {
      await db
        .update(subscriptionPayments)
        .set({
          status: 'REFUNDED',
          refundAmount: amount.toFixed(2),
          isPartialRefund: isPartial,
          refundedAt: now,
        })
        .where(eq(subscriptionPayments.id, paymentId));
    } else {
      const extPaymentId = `REFUND-${Date.now()}`;
      await db.insert(subscriptionPayments).values({
        photographerId,
        planId,
        amount: amount.toFixed(2),
        refundAmount: amount.toFixed(2),
        isPartialRefund: isPartial,
        currency: 'BRL',
        status: 'REFUNDED',
        paymentMethod,
        refundedAt: now,
        createdByAdminId: numericAdminId,
        externalPaymentId: extPaymentId,
      });
    }

    if (!isPartial && cancelSub) {
      const activeSubs = await db
        .select()
        .from(photographerSubscriptions)
        .where(
          and(
            eq(photographerSubscriptions.photographerId, photographerId),
            inArray(photographerSubscriptions.status, ['ACTIVE', 'CANCEL_SCHEDULED', 'PENDING'])
          )
        );

      for (const sub of activeSubs) {
        await db
          .update(photographerSubscriptions)
          .set({ status: 'CANCELLED', cancelledAt: now })
          .where(eq(photographerSubscriptions.id, sub.id));
      }

      const defaultFree = await this.getDefaultFreePlan();
      if (defaultFree) {
        await db.update(photographers).set({ plan: defaultFree.name }).where(eq(photographers.id, photographerId));
      }

      await db.insert(subscriptionHistory).values({
        photographerId,
        newStatus: 'CANCELLED',
        eventType: 'PAYMENT_REFUNDED',
        performedByType: 'ADMIN',
        performedUserId: numericAdminId,
        reason: 'Reembolso total efetuado. Plano encerrado.',
      });
    } else {
      await db.insert(subscriptionHistory).values({
        photographerId,
        eventType: 'PARTIAL_REFUND_ISSUED',
        performedByType: 'ADMIN',
        performedUserId: numericAdminId,
        reason: `Reembolso parcial de R$ ${amount.toFixed(2)} emitido. Plano mantido.`,
      });
    }

    return {
      success: true,
      message: isPartial
        ? `Reembolso parcial de R$ ${amount.toFixed(2)} registrado.`
        : 'Reembolso total registrado e assinatura cancelada com sucesso.',
    };
  }

  /**
   * Handle Chargeback (Disputa de pagamento)
   */
  static async adminHandleChargeback(subscriptionId: number, paymentId?: number, reason?: string, adminId?: number | string) {
    const numericAdminId = adminId ? (isNaN(Number(adminId)) ? null : Number(adminId)) : null;
    const subRes = await db.select().from(photographerSubscriptions).where(eq(photographerSubscriptions.id, subscriptionId));
    if (subRes.length === 0) throw new Error('Assinatura não encontrada.');
    const sub = subRes[0];

    const now = new Date();

    if (paymentId) {
      await db
        .update(subscriptionPayments)
        .set({ status: 'CHARGEBACK', isChargeback: true, cancelledAt: now })
        .where(eq(subscriptionPayments.id, paymentId));
    }

    await db
      .update(photographerSubscriptions)
      .set({
        status: 'CHARGEBACK',
        chargebackAlert: true,
        suspendedAt: now,
      })
      .where(eq(photographerSubscriptions.id, subscriptionId));

    await db.insert(subscriptionHistory).values({
      subscriptionId,
      photographerId: sub.photographerId,
      previousStatus: sub.status,
      newStatus: 'CHARGEBACK',
      eventType: 'CHARGEBACK_RECEIVED',
      performedByType: 'ADMIN',
      performedUserId: numericAdminId,
      reason: reason || 'Alerta de Chargeback / Contestação de Pagamento. Acesso suspenso para análise.',
    });

    return {
      success: true,
      message: 'Chargeback registrado. Acesso aos recursos Premium suspenso. Dados do fotógrafo foram preservados para análise manual.',
    };
  }

  /**
   * Calculate precise Admin Subscription & Financial Metrics
   * MRR strictly accounts for active paid subscriptions, converting annual prices correctly and excluding courtesies.
   */
  static async getAdminSubscriptionMetrics() {
    await this.checkAndExpireSubscriptions();

    const allSubs = await db.select().from(photographerSubscriptions);
    const allPlans = await db.select().from(subscriptionPlans);
    const planMap = new Map<number, any>(allPlans.map((p) => [p.id, p]));

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let mrr = 0;
    let totalActive = 0;
    let totalPending = 0;
    let totalCancelled = 0;
    let totalScheduledCancellation = 0;
    let totalComplimentary = 0;
    let totalExpiringIn7Days = 0;
    let totalSuspended = 0;

    const sevenDaysInFuture = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (const sub of allSubs) {
      const plan = sub.planId ? planMap.get(sub.planId) : null;
      const isFreePlan = !plan || Boolean(plan.isFree) || plan.planType === 'FREE';

      const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
      const isValidPeriod = periodEnd ? periodEnd >= now : true;

      if (sub.status === 'PENDING') {
        totalPending++;
      } else if (sub.status === 'CANCELLED' || sub.status === 'EXPIRED') {
        totalCancelled++;
      } else if (sub.status === 'SUSPENDED') {
        totalSuspended++;
      } else if (sub.status === 'ACTIVE' || sub.status === 'CANCEL_SCHEDULED') {
        if (isValidPeriod) {
          totalActive++;

          if (sub.status === 'CANCEL_SCHEDULED') {
            totalScheduledCancellation++;
          }

          if (sub.isComplimentary || !sub.countsAsRevenue) {
            totalComplimentary++;
          } else if (!isFreePlan) {
            // Compute MRR strictly for active paid subscriptions
            if (sub.billingCycle === 'YEARLY') {
              const annualPrice = parseFloat(plan?.annualPrice || '0.00');
              const monthlyEquivalent = parseFloat(plan?.annualMonthlyEquivalent || '0.00');
              const val = monthlyEquivalent > 0 ? monthlyEquivalent : annualPrice / 12;
              mrr += val;
            } else {
              const monthlyPrice = parseFloat(plan?.monthlyPrice || '0.00');
              mrr += monthlyPrice;
            }
          }

          if (periodEnd && periodEnd >= now && periodEnd <= sevenDaysInFuture) {
            totalExpiringIn7Days++;
          }
        }
      }
    }

    const arr = mrr * 12;

    // Calculate Received Revenue this month from approved payments
    const allPayments = await db.select().from(subscriptionPayments);
    let receivedRevenueMonth = 0;
    let totalRejectedPayments = 0;

    for (const pay of allPayments) {
      if (pay.status === 'REJECTED' || pay.status === 'CANCELLED') {
        totalRejectedPayments++;
      } else if (pay.status === 'APPROVED' && pay.paidAt) {
        const paidDate = new Date(pay.paidAt);
        if (paidDate.getFullYear() === currentYear && paidDate.getMonth() === currentMonth) {
          receivedRevenueMonth += parseFloat(pay.amount || '0.00');
        }
      }
    }

    return {
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      receivedRevenueMonth: Math.round(receivedRevenueMonth * 100) / 100,
      totalActive,
      totalPending,
      totalCancelled,
      totalScheduledCancellation,
      totalComplimentary,
      totalExpiringIn7Days,
      totalSuspended,
      totalRejectedPayments,
    };
  }
}
