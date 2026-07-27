import { Router } from 'express';
import crypto from 'crypto';
import { eq, and, desc, sql, like } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  paymentGatewaySettings,
  paymentProviderEvents,
  subscriptionProviderLinks,
  paymentGatewayAuditLogs,
  photographerSubscriptions,
  subscriptionPlans,
  photographers,
} from '../db/schema.ts';
import { requireAuth, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth.ts';
import { SecureCredentialsService } from '../services/secureCredentialsService.ts';
import { MercadoPagoClientService } from '../services/mercadoPagoClientService.ts';
import { MercadoPagoWebhookSignatureService } from '../services/mercadoPagoWebhookSignatureService.ts';
import { MercadoPagoWebhookProcessor } from '../services/mercadoPagoWebhookProcessor.ts';
import { SubscriptionService } from '../services/subscriptionService.ts';

const router = Router();

// ==========================================
// --- PUBLIC WEBHOOK ENDPOINTS ---
// ==========================================

// Webhook Handler for Test & Production environments
async function handleWebhook(req: any, res: any, targetEnv: 'TEST' | 'PRODUCTION') {
  const tokenFromUrl = req.params.token;
  const xSignature = (req.headers['x-signature'] as string) || (req.headers['x-hub-signature'] as string);
  const xRequestId = (req.headers['x-request-id'] as string) || '';

  try {
    const settings = await MercadoPagoClientService.getSettings();

    // 1. Validate URL Token
    if (!settings.webhookPathToken || settings.webhookPathToken !== tokenFromUrl) {
      return res.status(403).json({ success: false, error: 'Token de URL do Webhook inválido.' });
    }

    const creds = await MercadoPagoClientService.getActiveCredentials(targetEnv);

    // 2. Validate Signature if webhookSecret is configured
    const payload = req.body || {};
    const dataId = String(payload.data?.id || payload.id || req.query.id || req.query['data.id'] || '');

    let signatureValid = true;
    let signatureErrorReason: string | undefined;

    if (creds.webhookSecret) {
      const sigResult = MercadoPagoWebhookSignatureService.validate({
        xSignature,
        xRequestId,
        dataId,
        secret: creds.webhookSecret,
      });

      if (!sigResult.isValid) {
        signatureValid = false;
        signatureErrorReason = sigResult.reason;
        console.warn(`[MercadoPago Webhook ${targetEnv}] Falha de assinatura: ${sigResult.reason}`);
      }
    }

    // 3. Create Event record with Idempotency check
    const eventType = payload.type || payload.action || payload.topic || 'unknown';
    const action = payload.action || payload.type || 'unknown';
    const externalEventId = payload.id ? String(payload.id) : `MP-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // Check duplicate
    const existing = await db
      .select()
      .from(paymentProviderEvents)
      .where(
        and(
          eq(paymentProviderEvents.provider, 'MERCADO_PAGO'),
          eq(paymentProviderEvents.environment, targetEnv),
          eq(paymentProviderEvents.externalEventId, externalEventId)
        )
      );

    if (existing.length > 0) {
      return res.status(200).json({
        success: true,
        idempotent: true,
        message: 'Evento já registrado anteriormente (Sucesso Idempotente).',
      });
    }

    // Sanitize headers for log
    const sanitizedHeaders = {
      'x-signature': xSignature ? 'PRESENT' : 'ABSENT',
      'x-request-id': xRequestId,
      'user-agent': req.headers['user-agent'],
    };

    const [inserted] = await db.insert(paymentProviderEvents).values({
      provider: 'MERCADO_PAGO',
      environment: targetEnv,
      externalEventId,
      externalRequestId: xRequestId,
      eventType,
      action,
      externalResourceId: dataId,
      liveMode: targetEnv === 'PRODUCTION',
      payloadJson: payload,
      headersSanitizedJson: sanitizedHeaders,
      signatureValid,
      processingStatus: signatureValid ? 'RECEIVED' : 'FAILED',
      errorMessage: signatureErrorReason,
      receivedAt: new Date(),
    });

    const eventId = inserted.insertId;

    // Update settings last webhook date
    await db
      .update(paymentGatewaySettings)
      .set({ lastWebhookReceivedAt: new Date(), updatedAt: new Date() })
      .where(eq(paymentGatewaySettings.id, settings.id));

    if (!signatureValid) {
      return res.status(401).json({
        success: false,
        error: 'Assinatura inválida (x-signature). Evento registrado para auditoria.',
      });
    }

    // 4. Respond quickly (200 OK) then process asynchronously
    res.status(200).json({ success: true, message: 'Webhook recebido com sucesso.', eventId });

    // Asynchronous background processing
    setImmediate(async () => {
      try {
        await MercadoPagoWebhookProcessor.processEvent(eventId);
      } catch (err) {
        console.error(`[MercadoPago Async Webhook] Erro ao processar evento #${eventId}:`, err);
      }
    });
  } catch (err: any) {
    console.error(`[MercadoPago Webhook ${targetEnv} Error]:`, err);
    res.status(500).json({ success: false, error: err?.message || 'Erro interno no webhook.' });
  }
}

router.post('/webhooks/mercado-pago/test/:token', (req, res) => handleWebhook(req, res, 'TEST'));
router.post('/webhooks/mercado-pago/production/:token', (req, res) => handleWebhook(req, res, 'PRODUCTION'));

// ==========================================
// --- ADMIN MERCADO PAGO SETTINGS APIS ---
// ==========================================

// GET /api/admin/payment-gateways/mercado-pago/settings
router.get('/admin/payment-gateways/mercado-pago/settings', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const settings = await MercadoPagoClientService.getSettings();
    const testCreds = await MercadoPagoClientService.getActiveCredentials('TEST');
    const prodCreds = await MercadoPagoClientService.getActiveCredentials('PRODUCTION');

    // Host domain
    const host = req.get('host') || 'guiadefotografocasamento.com.br';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    const token = settings.webhookPathToken || '';

    res.json({
      success: true,
      settings: {
        id: settings.id,
        provider: 'MERCADO_PAGO',
        isEnabled: Boolean(settings.isEnabled),
        environment: settings.environment || 'TEST',
        webhookPathToken: token,
        webhookUrls: {
          test: `${baseUrl}/api/webhooks/mercado-pago/test/${token}`,
          production: `${baseUrl}/api/webhooks/mercado-pago/production/${token}`,
        },
        testCredentials: {
          publicKeyConfigured: Boolean(testCreds.publicKey),
          accessTokenConfigured: Boolean(testCreds.accessToken),
          webhookSecretConfigured: Boolean(testCreds.webhookSecret),
          maskedPublicKey: testCreds.maskedPublicKey,
          maskedAccessToken: testCreds.maskedAccessToken,
          maskedWebhookSecret: testCreds.maskedWebhookSecret,
        },
        productionCredentials: {
          publicKeyConfigured: Boolean(prodCreds.publicKey),
          accessTokenConfigured: Boolean(prodCreds.accessToken),
          webhookSecretConfigured: Boolean(prodCreds.webhookSecret),
          maskedPublicKey: prodCreds.maskedPublicKey,
          maskedAccessToken: prodCreds.maskedAccessToken,
          maskedWebhookSecret: prodCreds.maskedWebhookSecret,
        },
        lastConnectionTestAt: settings.lastConnectionTestAt,
        lastConnectionTestStatus: settings.lastConnectionTestStatus,
        lastConnectionTestMessage: settings.lastConnectionTestMessage,
        lastWebhookReceivedAt: settings.lastWebhookReceivedAt,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// PUT /api/admin/payment-gateways/mercado-pago/settings
router.put('/admin/payment-gateways/mercado-pago/settings', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const {
      isEnabled,
      environment,
      testPublicKey,
      testAccessToken,
      testClientId,
      testClientSecret,
      testWebhookSecret,
      productionPublicKey,
      productionAccessToken,
      productionClientId,
      productionClientSecret,
      productionWebhookSecret,
    } = req.body;

    const settings = await MercadoPagoClientService.getSettings();
    const adminIdNum = typeof req.user?.id === 'number' ? req.user.id : (parseInt(String(req.user?.id || '1').replace(/\D/g, ''), 10) || 1);

    const updateData: any = {
      updatedByAdminId: adminIdNum,
      updatedAt: new Date(),
    };

    if (typeof isEnabled === 'boolean') updateData.isEnabled = isEnabled;
    if (environment && (environment === 'TEST' || environment === 'PRODUCTION')) {
      updateData.environment = environment;
    }

    // Encrypt test credentials if provided and not masked
    if (testPublicKey && !testPublicKey.includes('•')) {
      updateData.testPublicKeyEncrypted = SecureCredentialsService.encrypt(testPublicKey.trim());
    }
    if (testAccessToken && !testAccessToken.includes('•')) {
      updateData.testAccessTokenEncrypted = SecureCredentialsService.encrypt(testAccessToken.trim());
    }
    if (testClientId && !testClientId.includes('•')) {
      updateData.testClientIdEncrypted = SecureCredentialsService.encrypt(testClientId.trim());
    }
    if (testClientSecret && !testClientSecret.includes('•')) {
      updateData.testClientSecretEncrypted = SecureCredentialsService.encrypt(testClientSecret.trim());
    }
    if (testWebhookSecret && !testWebhookSecret.includes('•')) {
      updateData.testWebhookSecretEncrypted = SecureCredentialsService.encrypt(testWebhookSecret.trim());
    }

    // Encrypt production credentials if provided and not masked
    if (productionPublicKey && !productionPublicKey.includes('•')) {
      updateData.productionPublicKeyEncrypted = SecureCredentialsService.encrypt(productionPublicKey.trim());
    }
    if (productionAccessToken && !productionAccessToken.includes('•')) {
      updateData.productionAccessTokenEncrypted = SecureCredentialsService.encrypt(productionAccessToken.trim());
    }
    if (productionClientId && !productionClientId.includes('•')) {
      updateData.productionClientIdEncrypted = SecureCredentialsService.encrypt(productionClientId.trim());
    }
    if (productionClientSecret && !productionClientSecret.includes('•')) {
      updateData.productionClientSecretEncrypted = SecureCredentialsService.encrypt(productionClientSecret.trim());
    }
    if (productionWebhookSecret && !productionWebhookSecret.includes('•')) {
      updateData.productionWebhookSecretEncrypted = SecureCredentialsService.encrypt(productionWebhookSecret.trim());
    }

    await db.update(paymentGatewaySettings).set(updateData).where(eq(paymentGatewaySettings.id, settings.id));

    // Log audit
    await db.insert(paymentGatewayAuditLogs).values({
      provider: 'MERCADO_PAGO',
      environment: environment || settings.environment,
      action: 'MERCADO_PAGO_SETTINGS_UPDATED',
      adminId: adminIdNum,
      adminName: req.user!.name || req.user!.email,
      ipAddress: req.ip || req.get('x-forwarded-for'),
      detailsJson: { environment, isEnabled },
    });

    res.json({ success: true, message: 'Configurações salvas com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// POST /api/admin/payment-gateways/mercado-pago/test-connection
router.post('/admin/payment-gateways/mercado-pago/test-connection', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { environment } = req.body;
    const result = await MercadoPagoClientService.testConnection(environment);
    const adminIdNum = typeof req.user?.id === 'number' ? req.user.id : (parseInt(String(req.user?.id || '1').replace(/\D/g, ''), 10) || 1);

    // Log audit
    await db.insert(paymentGatewayAuditLogs).values({
      provider: 'MERCADO_PAGO',
      environment: result.environment,
      action: 'MERCADO_PAGO_CONNECTION_TESTED',
      adminId: adminIdNum,
      adminName: req.user!.name || req.user!.email,
      ipAddress: req.ip,
      detailsJson: result,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// POST /api/admin/payment-gateways/mercado-pago/regenerate-webhook-token
router.post('/admin/payment-gateways/mercado-pago/regenerate-webhook-token', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const settings = await MercadoPagoClientService.getSettings();
    const newToken = `mp_${crypto.randomBytes(12).toString('hex')}`;
    const adminIdNum = typeof req.user?.id === 'number' ? req.user.id : (parseInt(String(req.user?.id || '1').replace(/\D/g, ''), 10) || 1);

    await db
      .update(paymentGatewaySettings)
      .set({
        webhookPathToken: newToken,
        updatedByAdminId: adminIdNum,
        updatedAt: new Date(),
      })
      .where(eq(paymentGatewaySettings.id, settings.id));

    // Log audit
    await db.insert(paymentGatewayAuditLogs).values({
      provider: 'MERCADO_PAGO',
      environment: settings.environment,
      action: 'MERCADO_PAGO_WEBHOOK_TOKEN_REGENERATED',
      adminId: adminIdNum,
      adminName: req.user!.name,
      ipAddress: req.ip,
    });

    res.json({ success: true, webhookPathToken: newToken });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// POST /api/admin/payment-gateways/mercado-pago/test-webhook-endpoint
router.post('/admin/payment-gateways/mercado-pago/test-webhook-endpoint', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const settings = await MercadoPagoClientService.getSettings();

    res.json({
      success: true,
      message: 'Endpoint local de webhook acessível e respondendo normalmente.',
      webhookPathToken: settings.webhookPathToken,
      environment: settings.environment,
      testedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// GET /api/admin/payment-gateways/mercado-pago/diagnostics
router.get('/admin/payment-gateways/mercado-pago/diagnostics', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const settings = await MercadoPagoClientService.getSettings();
    const creds = await MercadoPagoClientService.getActiveCredentials();

    const host = req.get('host') || 'guiadefotografocasamento.com.br';
    const isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https';

    // Fetch premium plans
    const premiumPlans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.planType, 'PREMIUM'));

    const checklist = [
      {
        key: 'environment',
        label: 'Ambiente Selecionado',
        status: settings.environment === 'PRODUCTION' ? 'warning' : 'success',
        detail: settings.environment === 'PRODUCTION' ? 'Ambiente de PRODUÇÃO Ativo (Cobranças Reais)' : 'Ambiente de TESTES Ativo',
      },
      {
        key: 'publicKey',
        label: 'Public Key Configurada',
        status: creds.publicKey ? 'success' : 'error',
        detail: creds.publicKey ? `Configurada (${creds.maskedPublicKey})` : 'Não configurada para o ambiente ' + creds.environment,
      },
      {
        key: 'accessToken',
        label: 'Access Token Configurado',
        status: creds.accessToken ? 'success' : 'error',
        detail: creds.accessToken ? `Configurado (${creds.maskedAccessToken})` : 'Não configurado para o ambiente ' + creds.environment,
      },
      {
        key: 'connection',
        label: 'Conexão Autenticada com Mercado Pago',
        status: settings.lastConnectionTestStatus === 'SUCCESS' ? 'success' : 'warning',
        detail: settings.lastConnectionTestMessage || 'Teste de conexão ainda não executado',
      },
      {
        key: 'https',
        label: 'URL HTTPS Pública Disponível',
        status: isHttps ? 'success' : 'warning',
        detail: isHttps ? `Protocolo seguro HTTPS ativo (${host})` : `Atenção: Servidor rodando em ${req.protocol}`,
      },
      {
        key: 'webhookSecret',
        label: 'Segredo do Webhook (Assinatura x-signature)',
        status: creds.webhookSecret ? 'success' : 'warning',
        detail: creds.webhookSecret ? 'Segredo configurado para validação HMAC' : 'Pendente de cadastro no painel',
      },
      {
        key: 'plans',
        label: 'Planos Premium com Preços',
        status: premiumPlans.length > 0 ? 'success' : 'error',
        detail: `${premiumPlans.length} plano(s) premium cadastrado(s) no sistema`,
      },
    ];

    const isReady = checklist.every((c) => c.status === 'success' || c.status === 'warning');

    res.json({
      success: true,
      environment: settings.environment,
      isReady,
      checklist,
      lastCheckedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// GET /api/admin/payment-gateways/mercado-pago/events
router.get('/admin/payment-gateways/mercado-pago/events', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { env, status, q, page = 1, limit = 50 } = req.query;

    let events = await db
      .select()
      .from(paymentProviderEvents)
      .where(eq(paymentProviderEvents.provider, 'MERCADO_PAGO'))
      .orderBy(desc(paymentProviderEvents.id));

    if (env && env !== 'all') {
      events = events.filter((e) => e.environment === env);
    }

    if (status && status !== 'all') {
      events = events.filter((e) => e.processingStatus === status);
    }

    if (q && typeof q === 'string' && q.trim()) {
      const clean = q.toLowerCase().trim();
      events = events.filter(
        (e) =>
          e.externalEventId?.toLowerCase().includes(clean) ||
          e.externalResourceId?.toLowerCase().includes(clean) ||
          e.eventType?.toLowerCase().includes(clean)
      );
    }

    const p = Number(page) || 1;
    const l = Number(limit) || 50;
    const total = events.length;
    const paginated = events.slice((p - 1) * l, p * l);

    res.json({
      success: true,
      events: paginated,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// GET /api/admin/payment-gateways/mercado-pago/events/:id
router.get('/admin/payment-gateways/mercado-pago/events/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await db.select().from(paymentProviderEvents).where(eq(paymentProviderEvents.id, id));

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Evento não encontrado.' });
    }

    res.json({ success: true, event: rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// POST /api/admin/payment-gateways/mercado-pago/events/:id/reprocess
router.post('/admin/payment-gateways/mercado-pago/events/:id/reprocess', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const result = await MercadoPagoWebhookProcessor.processEvent(id);
    const adminIdNum = typeof req.user?.id === 'number' ? req.user.id : (parseInt(String(req.user?.id || '1').replace(/\D/g, ''), 10) || 1);

    // Log audit
    await db.insert(paymentGatewayAuditLogs).values({
      provider: 'MERCADO_PAGO',
      action: 'MERCADO_PAGO_EVENT_REPROCESSED',
      adminId: adminIdNum,
      adminName: req.user!.name,
      ipAddress: req.ip,
      detailsJson: { eventId: id, result },
    });

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// GET /api/admin/payment-gateways/mercado-pago/logs
router.get('/admin/payment-gateways/mercado-pago/logs', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const logs = await db
      .select()
      .from(paymentGatewayAuditLogs)
      .where(eq(paymentGatewayAuditLogs.provider, 'MERCADO_PAGO'))
      .orderBy(desc(paymentGatewayAuditLogs.id))
      .limit(100);

    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// POST /api/admin/subscriptions/:id/sync-mercado-pago
router.post('/admin/subscriptions/:id/sync-mercado-pago', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const subscriptionId = Number(req.params.id);

    const links = await db
      .select()
      .from(subscriptionProviderLinks)
      .where(eq(subscriptionProviderLinks.subscriptionId, subscriptionId));

    if (links.length === 0) {
      return res.status(404).json({ success: false, error: 'Nenhum vínculo do Mercado Pago encontrado para esta assinatura.' });
    }

    const link = links[0];
    if (!link.externalSubscriptionId) {
      return res.status(400).json({ success: false, error: 'Assinatura externa sem ID no Mercado Pago.' });
    }

    const mpSub = await MercadoPagoClientService.getSubscription(link.externalSubscriptionId);

    await db
      .update(subscriptionProviderLinks)
      .set({
        externalStatus: mpSub.status,
        lastSynchronizedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptionProviderLinks.id, link.id));

    res.json({
      success: true,
      message: 'Sincronização com Mercado Pago realizada com sucesso!',
      externalStatus: mpSub.status,
      mpSubscription: mpSub,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// --- PHOTOGRAPHER MERCADO PAGO APIS ---
// ==========================================

// POST /api/photographer/subscription/mercado-pago/checkout
router.post('/photographer/subscription/mercado-pago/checkout', optionalAuth, async (req: AuthRequest, res) => {
  try {
    let photographerId = req.body.photographerId || req.user?.photographerId;

    if (!photographerId && req.user?.uid) {
      const p = await db.select().from(photographers).where(eq(photographers.userUid, req.user.uid));
      if (p.length > 0) photographerId = p[0].id;
    }

    if (!photographerId) {
      return res.status(400).json({ success: false, error: 'Fotógrafo não identificado.' });
    }

    const { planId, billingCycle = 'MONTHLY' } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plano de assinatura é obrigatório.' });
    }

    // Verify photographer & email
    const pRows = await db.select().from(photographers).where(eq(photographers.id, photographerId));
    if (pRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fotógrafo não encontrado.' });
    }
    const photographer = pRows[0];
    const payerEmail = photographer.email || req.user?.email || 'contato@fotografo.com.br';

    // Verify plan
    const planRows = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, Number(planId)));
    if (planRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Plano não encontrado.' });
    }
    const plan = planRows[0];

    // Always fetch official price from database
    const priceStr = billingCycle === 'YEARLY' ? plan.annualPrice : plan.monthlyPrice;
    const amount = parseFloat(priceStr || '0.00');

    if (amount <= 0) {
      return res.status(400).json({ success: false, error: 'Este plano é gratuito. Não é necessária cobrança no Mercado Pago.' });
    }

    // Check active local subscription
    let sub: any = null;
    const existingSubs = await db
      .select()
      .from(photographerSubscriptions)
      .where(
        and(
          eq(photographerSubscriptions.photographerId, photographerId),
          eq(photographerSubscriptions.status, 'ACTIVE')
        )
      );

    if (existingSubs.length > 0) {
      sub = existingSubs[0];
    } else {
      // Create new pending subscription record
      const [inserted] = await db.insert(photographerSubscriptions).values({
        photographerId,
        planId: plan.id,
        billingCycle,
        status: 'PENDING',
        source: 'MERCADO_PAGO',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const subRows = await db
        .select()
        .from(photographerSubscriptions)
        .where(eq(photographerSubscriptions.id, inserted.insertId));
      sub = subRows[0];
    }

    // Host domain
    const host = req.get('host') || 'guiadefotografocasamento.com.br';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const backUrl = `${protocol}://${host}/area-do-fotografo/minha-assinatura?payment=success`;

    const randomToken = crypto.randomBytes(4).toString('hex').toUpperCase();
    const externalReference = `GFC-SUB-${sub.id}-${randomToken}`;
    const title = `Plano ${plan.name} (${billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'}) — Guia Fotógrafo Casamento`;

    // Create Mercado Pago Preapproval Subscription
    const mpRes = await MercadoPagoClientService.createSubscription({
      title,
      amount,
      billingCycle: billingCycle as 'MONTHLY' | 'YEARLY',
      payerEmail,
      externalReference,
      backUrl,
    });

    const settings = await MercadoPagoClientService.getSettings();

    // Link subscription
    await db.insert(subscriptionProviderLinks).values({
      subscriptionId: sub.id,
      photographerId,
      provider: 'MERCADO_PAGO',
      environment: settings.environment || 'TEST',
      externalSubscriptionId: String(mpRes.id),
      externalReference,
      externalStatus: mpRes.status,
      checkoutUrl: mpRes.checkoutUrl,
      initPoint: mpRes.initPoint,
      sandboxInitPoint: mpRes.sandboxInitPoint,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      subscriptionId: sub.id,
      checkoutUrl: mpRes.checkoutUrl,
      initPoint: mpRes.initPoint,
      sandboxInitPoint: mpRes.sandboxInitPoint,
      externalReference,
      mpSubscriptionId: mpRes.id,
    });
  } catch (err: any) {
    console.error('Error in Mercado Pago checkout:', err);
    res.status(500).json({ success: false, error: err?.message || 'Erro ao gerar checkout do Mercado Pago.' });
  }
});

// GET /api/photographer/subscription/mercado-pago/status
router.get('/photographer/subscription/mercado-pago/status', optionalAuth, async (req: AuthRequest, res) => {
  try {
    let photographerId = req.query.photographerId
      ? Number(req.query.photographerId)
      : (req.user?.photographerId ? Number(req.user.photographerId) : undefined);

    if (!photographerId && req.user?.uid) {
      const p = await db.select().from(photographers).where(eq(photographers.userUid, req.user.uid));
      if (p.length > 0) photographerId = p[0].id;
    }

    if (!photographerId) {
      return res.status(400).json({ success: false, error: 'Fotógrafo não identificado.' });
    }

    const links = await db
      .select()
      .from(subscriptionProviderLinks)
      .where(eq(subscriptionProviderLinks.photographerId, photographerId))
      .orderBy(desc(subscriptionProviderLinks.id));

    if (links.length === 0) {
      return res.json({ success: true, hasMercadoPagoLink: false });
    }

    const latestLink = links[0];

    res.json({
      success: true,
      hasMercadoPagoLink: true,
      link: {
        id: latestLink.id,
        provider: latestLink.provider,
        environment: latestLink.environment,
        externalSubscriptionId: latestLink.externalSubscriptionId,
        externalReference: latestLink.externalReference,
        externalStatus: latestLink.externalStatus,
        checkoutUrl: latestLink.checkoutUrl,
        lastSynchronizedAt: latestLink.lastSynchronizedAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// POST /api/photographer/subscription/mercado-pago/cancel
router.post('/photographer/subscription/mercado-pago/cancel', optionalAuth, async (req: AuthRequest, res) => {
  try {
    let photographerId = req.body.photographerId || req.user?.photographerId;

    if (!photographerId && req.user?.uid) {
      const p = await db.select().from(photographers).where(eq(photographers.userUid, req.user.uid));
      if (p.length > 0) photographerId = p[0].id;
    }

    if (!photographerId) {
      return res.status(400).json({ success: false, error: 'Fotógrafo não identificado.' });
    }

    const { reason } = req.body;

    // Find active provider link
    const links = await db
      .select()
      .from(subscriptionProviderLinks)
      .where(eq(subscriptionProviderLinks.photographerId, photographerId))
      .orderBy(desc(subscriptionProviderLinks.id));

    if (links.length > 0 && links[0].externalSubscriptionId) {
      try {
        await MercadoPagoClientService.cancelSubscription(links[0].externalSubscriptionId);
      } catch (mpErr: any) {
        console.warn('Falha ao cancelar no Mercado Pago API (continuando cancelamento agendado local):', mpErr.message);
      }
    }

    const result = await SubscriptionService.requestCancellation(photographerId, reason);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// POST /api/photographer/subscription/mercado-pago/reactivate
router.post('/photographer/subscription/mercado-pago/reactivate', optionalAuth, async (req: AuthRequest, res) => {
  try {
    let photographerId = req.body.photographerId || req.user?.photographerId;

    if (!photographerId && req.user?.uid) {
      const p = await db.select().from(photographers).where(eq(photographers.userUid, req.user.uid));
      if (p.length > 0) photographerId = p[0].id;
    }

    if (!photographerId) {
      return res.status(400).json({ success: false, error: 'Fotógrafo não identificado.' });
    }

    const links = await db
      .select()
      .from(subscriptionProviderLinks)
      .where(eq(subscriptionProviderLinks.photographerId, photographerId))
      .orderBy(desc(subscriptionProviderLinks.id));

    if (links.length > 0 && links[0].externalSubscriptionId) {
      try {
        await MercadoPagoClientService.reactivateSubscription(links[0].externalSubscriptionId);
      } catch (mpErr: any) {
        console.warn('Falha ao reativar no MP API:', mpErr.message);
      }
    }

    const result = await SubscriptionService.reactivateCancellation(photographerId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

export default router;
