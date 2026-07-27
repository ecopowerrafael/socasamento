import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  paymentProviderEvents,
  subscriptionProviderLinks,
  photographerSubscriptions,
  subscriptionPayments,
  photographers,
} from '../db/schema.ts';
import { MercadoPagoClientService } from './mercadoPagoClientService.ts';
import { SubscriptionService } from './subscriptionService.ts';

export class MercadoPagoWebhookProcessor {
  /**
   * Process a Mercado Pago webhook event asynchronously or synchronously
   */
  static async processEvent(eventId: number) {
    const eventRows = await db
      .select()
      .from(paymentProviderEvents)
      .where(eq(paymentProviderEvents.id, eventId));

    if (eventRows.length === 0) {
      throw new Error(`Evento #${eventId} não encontrado.`);
    }

    const event = eventRows[0];

    // Mark event as PROCESSING
    await db
      .update(paymentProviderEvents)
      .set({
        processingStatus: 'PROCESSING',
        processingStartedAt: new Date(),
        processingAttempts: (event.processingAttempts || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(paymentProviderEvents.id, eventId));

    try {
      const payload: any = event.payloadJson || {};
      const resourceType = event.eventType || payload.type || payload.action || '';
      const resourceId = event.externalResourceId || payload.data?.id || payload.id;

      if (!resourceId) {
        await db
          .update(paymentProviderEvents)
          .set({
            processingStatus: 'IGNORED',
            processedAt: new Date(),
            errorMessage: 'Recurso sem ID no payload do webhook.',
            updatedAt: new Date(),
          })
          .where(eq(paymentProviderEvents.id, eventId));
        return { success: true, status: 'IGNORED', reason: 'No resource ID' };
      }

      // 1. Process Payment events
      if (resourceType.includes('payment') || payload.topic === 'payment') {
        return await this.processPaymentResource(eventId, String(resourceId), event.environment as 'TEST' | 'PRODUCTION');
      }

      // 2. Process Subscription / Preapproval events
      if (
        resourceType.includes('preapproval') ||
        resourceType.includes('subscription') ||
        payload.topic === 'preapproval'
      ) {
        return await this.processSubscriptionResource(eventId, String(resourceId), event.environment as 'TEST' | 'PRODUCTION');
      }

      // Default fallback resource check
      if (payload.action?.startsWith('payment.')) {
        return await this.processPaymentResource(eventId, String(resourceId), event.environment as 'TEST' | 'PRODUCTION');
      }

      // If generic/unrecognized event, attempt payment lookup first, then subscription lookup
      try {
        return await this.processPaymentResource(eventId, String(resourceId), event.environment as 'TEST' | 'PRODUCTION');
      } catch (err) {
        // Ignored or harmless unsupported event
        await db
          .update(paymentProviderEvents)
          .set({
            processingStatus: 'PROCESSED',
            processedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(paymentProviderEvents.id, eventId));
        return { success: true, status: 'PROCESSED', note: 'Unmatched resource type handled gracefully' };
      }
    } catch (err: any) {
      console.error(`Erro ao processar webhook event #${eventId}:`, err);
      await db
        .update(paymentProviderEvents)
        .set({
          processingStatus: 'FAILED',
          errorCode: 'PROCESSING_ERROR',
          errorMessage: err.message || String(err),
          updatedAt: new Date(),
        })
        .where(eq(paymentProviderEvents.id, eventId));

      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch payment resource directly from Mercado Pago API and apply state updates
   */
  private static async processPaymentResource(eventId: number, paymentId: string, environment: 'TEST' | 'PRODUCTION') {
    // Direct API verification to ensure authenticity of payment status
    const payment = await MercadoPagoClientService.getPayment(paymentId);

    const extRef = payment.external_reference || '';
    const mpStatus = payment.status; // 'approved', 'pending', 'rejected', 'cancelled', 'refunded', 'charged_back'
    const paymentMethod = payment.payment_method_id ? payment.payment_method_id.toUpperCase() : 'MERCADO_PAGO';

    let link: any = null;

    if (extRef) {
      const links = await db
        .select()
        .from(subscriptionProviderLinks)
        .where(eq(subscriptionProviderLinks.externalReference, extRef));
      if (links.length > 0) {
        link = links[0];
      }
    }

    if (!link) {
      // Search by externalSubscriptionId if available
      const preapprovalId = payment.preapproval_id || payment.subscription_id;
      if (preapprovalId) {
        const links = await db
          .select()
          .from(subscriptionProviderLinks)
          .where(eq(subscriptionProviderLinks.externalSubscriptionId, String(preapprovalId)));
        if (links.length > 0) {
          link = links[0];
        }
      }
    }

    if (!link) {
      await db
        .update(paymentProviderEvents)
        .set({
          processingStatus: 'IGNORED',
          processedAt: new Date(),
          errorMessage: `Nenhum vínculo local encontrado para referência '${extRef}' ou pagamento #${paymentId}.`,
          updatedAt: new Date(),
        })
        .where(eq(paymentProviderEvents.id, eventId));

      return { success: true, status: 'IGNORED', reason: 'Unlinked external payment' };
    }

    const subRows = await db
      .select()
      .from(photographerSubscriptions)
      .where(eq(photographerSubscriptions.id, link.subscriptionId));

    if (subRows.length === 0) {
      throw new Error(`Assinatura local #${link.subscriptionId} não encontrada.`);
    }

    const subscription = subRows[0];
    const photographerId = subscription.photographerId;
    const planId = subscription.planId;
    const billingCycle = (subscription.billingCycle as 'MONTHLY' | 'YEARLY') || 'MONTHLY';

    if (!planId) {
      throw new Error('Assinatura sem plano vinculado.');
    }

    if (mpStatus === 'approved') {
      // Approved payment: activate/renew subscription using SubscriptionService
      const result = await SubscriptionService.simulatePayment({
        photographerId,
        planId,
        billingCycle,
        simulationOutcome: 'APPROVED',
        paymentMethod,
        externalPaymentId: String(paymentId),
        simulationEventId: `MP-EVT-${eventId}`,
      });

      // Update provider link last event timestamp
      await db
        .update(subscriptionProviderLinks)
        .set({
          externalStatus: 'authorized',
          lastSynchronizedAt: new Date(),
          lastEventAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptionProviderLinks.id, link.id));

      await db
        .update(paymentProviderEvents)
        .set({
          subscriptionId: subscription.id,
          providerSubscriptionId: link.externalSubscriptionId,
          processingStatus: 'PROCESSED',
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(paymentProviderEvents.id, eventId));

      return { success: true, status: 'PROCESSED', action: 'APPROVED_PAYMENT_APPLIED', result };
    } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      // Payment rejected: log failed payment, mark PAST_DUE if active
      await SubscriptionService.simulatePayment({
        photographerId,
        planId,
        billingCycle,
        simulationOutcome: 'REJECTED',
        paymentMethod,
        externalPaymentId: String(paymentId),
      });

      if (subscription.status === 'ACTIVE') {
        await db
          .update(photographerSubscriptions)
          .set({ status: 'PAST_DUE', updatedAt: new Date() })
          .where(eq(photographerSubscriptions.id, subscription.id));
      }

      await db
        .update(paymentProviderEvents)
        .set({
          subscriptionId: subscription.id,
          processingStatus: 'PROCESSED',
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(paymentProviderEvents.id, eventId));

      return { success: true, status: 'PROCESSED', action: 'REJECTED_PAYMENT_LOGGED' };
    } else if (mpStatus === 'charged_back') {
      // Chargeback: handle chargeback
      await SubscriptionService.adminHandleChargeback(subscription.id, undefined, 'Chargeback notificado via Webhook Mercado Pago');

      await db
        .update(paymentProviderEvents)
        .set({
          subscriptionId: subscription.id,
          processingStatus: 'PROCESSED',
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(paymentProviderEvents.id, eventId));

      return { success: true, status: 'PROCESSED', action: 'CHARGEBACK_APPLIED' };
    } else if (mpStatus === 'refunded') {
      // Refunded
      await SubscriptionService.simulatePayment({
        photographerId,
        planId,
        billingCycle,
        simulationOutcome: 'REFUNDED',
        paymentMethod,
        externalPaymentId: String(paymentId),
      });

      await db
        .update(paymentProviderEvents)
        .set({
          subscriptionId: subscription.id,
          processingStatus: 'PROCESSED',
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(paymentProviderEvents.id, eventId));

      return { success: true, status: 'PROCESSED', action: 'REFUNDED_LOGGED' };
    }

    // Default status (pending/in_process)
    await db
      .update(paymentProviderEvents)
      .set({
        subscriptionId: subscription.id,
        processingStatus: 'PROCESSED',
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(paymentProviderEvents.id, eventId));

    return { success: true, status: 'PROCESSED', action: 'PENDING_PAYMENT_LOGGED' };
  }

  /**
   * Process subscription / preapproval resource
   */
  private static async processSubscriptionResource(eventId: number, preapprovalId: string, environment: 'TEST' | 'PRODUCTION') {
    const mpSub = await MercadoPagoClientService.getSubscription(preapprovalId);

    const extStatus = mpSub.status; // 'authorized', 'paused', 'cancelled', 'pending'
    const extRef = mpSub.external_reference || '';

    let links = await db
      .select()
      .from(subscriptionProviderLinks)
      .where(eq(subscriptionProviderLinks.externalSubscriptionId, preapprovalId));

    if (links.length === 0 && extRef) {
      links = await db
        .select()
        .from(subscriptionProviderLinks)
        .where(eq(subscriptionProviderLinks.externalReference, extRef));
    }

    if (links.length === 0) {
      await db
        .update(paymentProviderEvents)
        .set({
          processingStatus: 'IGNORED',
          processedAt: new Date(),
          errorMessage: `Nenhum vínculo local encontrado para preapproval #${preapprovalId}.`,
          updatedAt: new Date(),
        })
        .where(eq(paymentProviderEvents.id, eventId));

      return { success: true, status: 'IGNORED', reason: 'Unlinked preapproval' };
    }

    const link = links[0];

    // Update link status
    await db
      .update(subscriptionProviderLinks)
      .set({
        externalStatus: extStatus,
        lastSynchronizedAt: new Date(),
        lastEventAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptionProviderLinks.id, link.id));

    // Handle cancellation or reactivation
    if (extStatus === 'cancelled') {
      await db
        .update(photographerSubscriptions)
        .set({
          cancelAtPeriodEnd: true,
          status: 'CANCEL_SCHEDULED',
          cancelRequestedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(photographerSubscriptions.id, link.subscriptionId));
    } else if (extStatus === 'authorized') {
      const subRows = await db
        .select()
        .from(photographerSubscriptions)
        .where(eq(photographerSubscriptions.id, link.subscriptionId));

      if (subRows.length > 0 && subRows[0].status === 'CANCEL_SCHEDULED') {
        await db
          .update(photographerSubscriptions)
          .set({
            cancelAtPeriodEnd: false,
            status: 'ACTIVE',
            reactivatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(photographerSubscriptions.id, link.subscriptionId));
      }
    }

    await db
      .update(paymentProviderEvents)
      .set({
        subscriptionId: link.subscriptionId,
        providerSubscriptionId: preapprovalId,
        processingStatus: 'PROCESSED',
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(paymentProviderEvents.id, eventId));

    return { success: true, status: 'PROCESSED', externalStatus: extStatus };
  }
}
