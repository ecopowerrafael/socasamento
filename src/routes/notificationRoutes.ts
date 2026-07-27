import { Router } from 'express';
import webpush from 'web-push';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  notificationAutomationRules,
  notificationDeliveries,
  notificationDeliveryQueue,
  notificationPreferences,
  notificationTemplates,
  pushCampaignRecipients,
  pushCampaigns,
  pushNotificationSettings,
  pushSubscriptions,
  smtpSettings,
  emailMessages,
  userNotifications,
  users,
} from '../db/schema.ts';
import { AuthRequest, requireAdmin, requireAuth } from '../middleware/auth.ts';
import { SecureCredentialsService } from '../services/secureCredentialsService.ts';
import {
  EmailNotificationService,
  NotificationEventService,
  endpointHash,
  publicPushSettings,
} from '../services/notificationSystem.ts';

const router = Router();
const userType = (role?: string) => role === 'photographer' ? 'PHOTOGRAPHER' : role === 'admin' || role === 'super_admin' ? 'ADMIN' : 'BRIDE';
const internalUrl = (value: unknown) => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/notificacoes';

async function authUserId(req: AuthRequest): Promise<number> {
  const direct = Number(req.user?.id);
  if (Number.isInteger(direct) && direct > 0) return direct;
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.uid, req.user!.uid)).limit(1);
  if (!user) throw new Error('Usuário autenticado não encontrado');
  return user.id;
}

router.get('/push/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = await authUserId(req);
    const [settings] = await db.select().from(pushNotificationSettings).limit(1);
    const devices = await db.select({
      id: pushSubscriptions.id,
      deviceName: pushSubscriptions.deviceName,
      browser: pushSubscriptions.browser,
      operatingSystem: pushSubscriptions.operatingSystem,
      isPwa: pushSubscriptions.isPwa,
      permissionStatus: pushSubscriptions.permissionStatus,
      lastSuccessAt: pushSubscriptions.lastSuccessAt,
      createdAt: pushSubscriptions.createdAt,
    }).from(pushSubscriptions).where(and(eq(pushSubscriptions.userId, id), eq(pushSubscriptions.isActive, true)));
    res.json({ success: true, enabled: settings?.isEnabled === true, publicKey: settings?.vapidPublicKey || null, devices });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/push/subscribe', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = await authUserId(req);
    const { subscription, device = {} } = req.body || {};
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ success: false, error: 'Inscrição Push inválida.' });
    }
    if (String(subscription.endpoint).length > 4096) return res.status(413).json({ success: false, error: 'Endpoint muito grande.' });
    const hash = endpointHash(subscription.endpoint);
    const [existing] = await db.select().from(pushSubscriptions).where(and(eq(pushSubscriptions.userId, id), eq(pushSubscriptions.endpointHash, hash))).limit(1);
    const values = {
      endpoint: subscription.endpoint,
      endpointHash: hash,
      p256dhKey: subscription.keys.p256dh,
      authKey: subscription.keys.auth,
      userType: userType(req.user?.role),
      browser: String(device.browser || '').slice(0, 100),
      operatingSystem: String(device.operatingSystem || '').slice(0, 100),
      deviceType: String(device.deviceType || '').slice(0, 50),
      deviceName: String(device.deviceName || '').slice(0, 255),
      language: String(device.language || req.headers['accept-language'] || '').slice(0, 50),
      timezone: String(device.timezone || '').slice(0, 100),
      isPwa: Boolean(device.isPwa),
      isActive: true,
      permissionStatus: 'granted',
      revokedAt: null,
    };
    if (existing) await db.update(pushSubscriptions).set(values).where(eq(pushSubscriptions.id, existing.id));
    else await db.insert(pushSubscriptions).values({ userId: id, ...values });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/push/unsubscribe', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = await authUserId(req);
    const endpoint = String(req.body?.endpoint || '');
    await db.update(pushSubscriptions).set({ isActive: false, permissionStatus: 'denied', revokedAt: new Date() })
      .where(and(eq(pushSubscriptions.userId, id), eq(pushSubscriptions.endpointHash, endpointHash(endpoint))));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/push/test', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = await authUserId(req);
    const notification = await NotificationEventService.emit({
      eventType: 'PUSH_TEST',
      userId: id,
      userType: userType(req.user?.role),
      title: 'Notificações ativadas',
      message: 'Seu dispositivo está pronto para receber novidades do Guia Casamento.',
      category: 'SYSTEM',
      actionUrl: '/notificacoes',
      deduplicationKey: `push-test-${id}-${new Date().toISOString().slice(0, 10)}`,
    });
    res.json({ success: true, notification });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/notifications', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = await authUserId(req);
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
    const items = await db.select().from(userNotifications)
      .where(and(eq(userNotifications.userId, id), eq(userNotifications.isArchived, false)))
      .orderBy(desc(userNotifications.createdAt)).limit(limit);
    res.json({ success: true, notifications: items });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/notifications/unread-count', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = await authUserId(req);
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(userNotifications)
      .where(and(eq(userNotifications.userId, id), eq(userNotifications.isRead, false), eq(userNotifications.isArchived, false)));
    res.json({ success: true, count: Number(row?.count || 0) });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

router.post('/notifications/read-all', requireAuth, async (req: AuthRequest, res) => {
  const id = await authUserId(req);
  await db.update(userNotifications).set({ isRead: true, readAt: new Date() }).where(and(eq(userNotifications.userId, id), eq(userNotifications.isRead, false)));
  res.json({ success: true });
});

router.post('/notifications/:id/read', requireAuth, async (req: AuthRequest, res) => {
  const id = await authUserId(req);
  await db.update(userNotifications).set({ isRead: true, readAt: new Date() }).where(and(eq(userNotifications.id, Number(req.params.id)), eq(userNotifications.userId, id)));
  res.json({ success: true });
});

router.post('/notifications/:id/archive', requireAuth, async (req: AuthRequest, res) => {
  const id = await authUserId(req);
  await db.update(userNotifications).set({ isArchived: true, archivedAt: new Date() }).where(and(eq(userNotifications.id, Number(req.params.id)), eq(userNotifications.userId, id)));
  res.json({ success: true });
});

router.delete('/notifications/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = await authUserId(req);
  await db.delete(userNotifications).where(and(eq(userNotifications.id, Number(req.params.id)), eq(userNotifications.userId, id)));
  res.json({ success: true });
});

router.post('/notifications/:id/click', requireAuth, async (req: AuthRequest, res) => {
  const id = await authUserId(req);
  await db.update(userNotifications).set({ isRead: true, readAt: new Date() }).where(and(eq(userNotifications.id, Number(req.params.id)), eq(userNotifications.userId, id)));
  res.json({ success: true });
});

router.get('/notification-preferences', requireAuth, async (req: AuthRequest, res) => {
  const id = await authUserId(req);
  const preferences = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, id));
  res.json({ success: true, preferences, mandatoryEvents: Array.from(['SECURITY_ALERT', 'PASSWORD_CHANGED', 'EMAIL_CONFIRMATION', 'PAYMENT_APPROVED', 'SUBSCRIPTION_CANCELLED']) });
});

router.put('/notification-preferences', requireAuth, async (req: AuthRequest, res) => {
  const id = await authUserId(req);
  const updates = Array.isArray(req.body?.preferences) ? req.body.preferences.slice(0, 100) : [];
  for (const item of updates) {
    const eventType = String(item.eventType || '').slice(0, 100);
    if (!eventType) continue;
    const [existing] = await db.select().from(notificationPreferences).where(and(eq(notificationPreferences.userId, id), eq(notificationPreferences.eventType, eventType))).limit(1);
    const values = {
      userType: userType(req.user?.role),
      inAppEnabled: Boolean(item.inAppEnabled),
      pushEnabled: Boolean(item.pushEnabled),
      emailEnabled: Boolean(item.emailEnabled),
    };
    if (existing) await db.update(notificationPreferences).set(values).where(eq(notificationPreferences.id, existing.id));
    else await db.insert(notificationPreferences).values({ userId: id, eventType, ...values });
  }
  res.json({ success: true });
});

router.get('/admin/push/settings', requireAuth, requireAdmin, async (_req, res) => {
  const [settings] = await db.select().from(pushNotificationSettings).limit(1);
  res.json({ success: true, settings: publicPushSettings(settings) });
});

router.put('/admin/push/settings', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const adminId = await authUserId(req);
  const [existing] = await db.select().from(pushNotificationSettings).limit(1);
  const values = {
    isEnabled: Boolean(req.body.isEnabled),
    vapidSubject: String(req.body.vapidSubject || 'mailto:contato@guiadefotografocasamento.com.br'),
    defaultIconUrl: internalUrl(req.body.defaultIconUrl || '/icons/icon-192.png'),
    defaultBadgeUrl: internalUrl(req.body.defaultBadgeUrl || '/icons/badge-96.png'),
    defaultClickUrl: internalUrl(req.body.defaultClickUrl || '/notificacoes'),
    maxDailyManualSends: Math.max(1, Number(req.body.maxDailyManualSends) || 10),
    quietHoursEnabled: Boolean(req.body.quietHoursEnabled),
    quietHoursStart: String(req.body.quietHoursStart || '22:00'),
    quietHoursEnd: String(req.body.quietHoursEnd || '08:00'),
    timezone: String(req.body.timezone || 'America/Sao_Paulo'),
    updatedByAdminId: adminId,
  };
  if (existing) await db.update(pushNotificationSettings).set(values).where(eq(pushNotificationSettings.id, existing.id));
  else await db.insert(pushNotificationSettings).values({ ...values, createdByAdminId: adminId });
  const [saved] = await db.select().from(pushNotificationSettings).limit(1);
  res.json({ success: true, settings: publicPushSettings(saved) });
});

router.post('/admin/push/generate-vapid-keys', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const adminId = await authUserId(req);
  const keys = webpush.generateVAPIDKeys();
  const [existing] = await db.select().from(pushNotificationSettings).limit(1);
  const values = {
    isEnabled: true,
    vapidPublicKey: keys.publicKey,
    vapidPrivateKeyEncrypted: SecureCredentialsService.encrypt(keys.privateKey),
    vapidSubject: String(req.body?.subject || existing?.vapidSubject || 'mailto:contato@guiadefotografocasamento.com.br'),
    updatedByAdminId: adminId,
  };
  if (existing) await db.update(pushNotificationSettings).set(values).where(eq(pushNotificationSettings.id, existing.id));
  else await db.insert(pushNotificationSettings).values({ ...values, createdByAdminId: adminId });
  res.json({ success: true, publicKey: keys.publicKey, privateKeyConfigured: true });
});

router.get('/admin/push/subscriptions', requireAuth, requireAdmin, async (_req, res) => {
  const devices = await db.select().from(pushSubscriptions).orderBy(desc(pushSubscriptions.createdAt)).limit(500);
  res.json({ success: true, devices: devices.map(({ endpoint, p256dhKey, authKey, ...safe }) => safe) });
});

router.get('/admin/push/statistics', requireAuth, requireAdmin, async (_req, res) => {
  const [active] = await db.select({ count: sql<number>`count(*)` }).from(pushSubscriptions).where(eq(pushSubscriptions.isActive, true));
  const [queued] = await db.select({ count: sql<number>`count(*)` }).from(notificationDeliveryQueue).where(inArray(notificationDeliveryQueue.status, ['PENDING', 'RETRY_PENDING', 'PROCESSING']));
  const [unread] = await db.select({ count: sql<number>`count(*)` }).from(userNotifications).where(eq(userNotifications.isRead, false));
  res.json({ success: true, statistics: { activeDevices: Number(active?.count || 0), queued: Number(queued?.count || 0), unread: Number(unread?.count || 0) } });
});

router.get('/admin/push/campaigns', requireAuth, requireAdmin, async (_req, res) => {
  const campaigns = await db.select().from(pushCampaigns).orderBy(desc(pushCampaigns.createdAt)).limit(100);
  res.json({ success: true, campaigns });
});

router.get('/admin/push/campaigns/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [campaign] = await db.select().from(pushCampaigns).where(eq(pushCampaigns.id, id)).limit(1);
  if (!campaign) return res.status(404).json({ success: false, error: 'Campanha não encontrada.' });
  const recipients = await db.select().from(pushCampaignRecipients).where(eq(pushCampaignRecipients.campaignId, id)).limit(500);
  res.json({ success: true, campaign, recipients });
});

router.post('/admin/push/campaigns', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const adminId = await authUserId(req);
  const [campaign] = await db.insert(pushCampaigns).values({
    name: String(req.body.name || req.body.title || '').slice(0, 255),
    title: String(req.body.title || '').slice(0, 255),
    message: String(req.body.message || '').slice(0, 2000),
    imageUrl: req.body.imageUrl || null,
    actionUrl: internalUrl(req.body.actionUrl),
    targetType: String(req.body.targetType || 'ALL'),
    targetFiltersJson: req.body.targetFilters || {},
    priority: String(req.body.priority || 'NORMAL'),
    status: req.body.scheduledAt ? 'SCHEDULED' : 'DRAFT',
    scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
    createdByAdminId: adminId,
  }).$returningId();
  res.status(201).json({ success: true, id: campaign.id });
});

router.post('/admin/push/campaigns/:id/send', requireAuth, requireAdmin, async (req, res) => {
  const campaignId = Number(req.params.id);
  const [campaign] = await db.select().from(pushCampaigns).where(eq(pushCampaigns.id, campaignId)).limit(1);
  if (!campaign || !['DRAFT', 'SCHEDULED'].includes(campaign.status || '')) return res.status(409).json({ success: false, error: 'Campanha indisponível.' });
  const roleFilter = campaign.targetType === 'PHOTOGRAPHERS' ? 'photographer' : campaign.targetType === 'BRIDES' ? 'bride' : campaign.targetType === 'ADMINS' ? 'admin' : null;
  const recipients = roleFilter ? await db.select().from(users).where(eq(users.role, roleFilter)) : await db.select().from(users);
  for (const recipient of recipients) {
    const created = await NotificationEventService.emit({
      eventType: 'ADMIN_CAMPAIGN',
      userId: recipient.id,
      userType: userType(recipient.role),
      title: campaign.title,
      message: campaign.message,
      category: 'ADMINISTRATIVE',
      priority: (campaign.priority as any) || 'NORMAL',
      actionUrl: campaign.actionUrl,
      deduplicationKey: `campaign-${campaign.id}-user-${recipient.id}`,
    });
    if (created) await db.insert(pushCampaignRecipients).values({ campaignId, userId: recipient.id, status: 'PENDING' });
  }
  await db.update(pushCampaigns).set({ status: 'PROCESSING', startedAt: new Date(), totalUsers: recipients.length }).where(eq(pushCampaigns.id, campaignId));
  res.json({ success: true, recipients: recipients.length });
});

router.post('/admin/push/campaigns/:id/cancel', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.update(pushCampaigns).set({ status: 'CANCELLED', cancelledAt: new Date() }).where(eq(pushCampaigns.id, id));
  await db.update(notificationDeliveryQueue).set({ status: 'CANCELLED' }).where(and(eq(notificationDeliveryQueue.campaignId, id), inArray(notificationDeliveryQueue.status, ['PENDING', 'RETRY_PENDING'])));
  res.json({ success: true });
});

router.post('/admin/push/test', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const id = await authUserId(req);
  const notification = await NotificationEventService.emit({
    eventType: 'ADMIN_PUSH_TEST',
    userId: id,
    userType: 'ADMIN',
    title: String(req.body?.title || 'Teste de Web Push').slice(0, 255),
    message: String(req.body?.message || 'O Web Push do Guia Casamento está funcionando.').slice(0, 2000),
    category: 'ADMINISTRATIVE',
    actionUrl: internalUrl(req.body?.actionUrl),
    deduplicationKey: `admin-push-test-${id}-${Date.now()}`,
  });
  await db.update(pushNotificationSettings).set({ lastTestAt: new Date(), lastTestStatus: 'QUEUED', lastTestMessage: 'Teste adicionado à fila.' });
  res.json({ success: true, notification });
});

router.get('/admin/push/history', requireAuth, requireAdmin, async (_req, res) => {
  const history = await db.select().from(notificationDeliveries).orderBy(desc(notificationDeliveries.createdAt)).limit(500);
  res.json({ success: true, history });
});

router.get('/admin/smtp/settings', requireAuth, requireAdmin, async (_req, res) => {
  const [settings] = await db.select().from(smtpSettings).limit(1);
  if (!settings) return res.json({ success: true, settings: null });
  const { usernameEncrypted, passwordEncrypted, ...safe } = settings;
  res.json({ success: true, settings: { ...safe, usernameConfigured: Boolean(usernameEncrypted), passwordConfigured: Boolean(passwordEncrypted) } });
});

router.put('/admin/smtp/settings', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const adminId = await authUserId(req);
  const [existing] = await db.select().from(smtpSettings).limit(1);
  const values: any = {
    isEnabled: Boolean(req.body.isEnabled),
    host: String(req.body.host || '').slice(0, 255),
    port: Number(req.body.port) || 587,
    secureMode: String(req.body.secureMode || 'STARTTLS'),
    fromName: String(req.body.fromName || 'Guia Fotógrafo Casamento'),
    fromEmail: String(req.body.fromEmail || '').slice(0, 255),
    replyToEmail: String(req.body.replyToEmail || '').slice(0, 255),
    rateLimitPerMinute: Math.max(1, Number(req.body.rateLimitPerMinute) || 60),
    rateLimitPerHour: Math.max(1, Number(req.body.rateLimitPerHour) || 1000),
    updatedByAdminId: adminId,
  };
  if (req.body.username) values.usernameEncrypted = SecureCredentialsService.encrypt(String(req.body.username));
  if (req.body.password) values.passwordEncrypted = SecureCredentialsService.encrypt(String(req.body.password));
  if (existing) await db.update(smtpSettings).set(values).where(eq(smtpSettings.id, existing.id));
  else await db.insert(smtpSettings).values({ ...values, createdByAdminId: adminId });
  res.json({ success: true });
});

router.post('/admin/smtp/verify', requireAuth, requireAdmin, async (_req, res) => {
  try {
    await EmailNotificationService.verify();
    await db.update(smtpSettings).set({ lastTestAt: new Date(), lastTestStatus: 'SUCCESS', lastTestMessage: 'Conexão SMTP verificada.' });
    res.json({ success: true, message: 'Conexão SMTP verificada.' });
  } catch (error: any) {
    await db.update(smtpSettings).set({ lastTestAt: new Date(), lastTestStatus: 'FAILED', lastTestMessage: String(error.message).slice(0, 500) });
    res.status(400).json({ success: false, error: 'Não foi possível conectar ao servidor SMTP.' });
  }
});

router.post('/admin/smtp/send-test', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const id = await authUserId(req);
  const notification = await NotificationEventService.emit({
    eventType: 'SMTP_TEST',
    userId: id,
    userType: 'ADMIN',
    title: 'Teste de e-mail do Guia Casamento',
    message: 'A configuração SMTP foi validada e esta mensagem percorreu a fila persistente.',
    category: 'ADMINISTRATIVE',
    actionUrl: '/admin',
    deduplicationKey: `smtp-test-${id}-${Date.now()}`,
  });
  res.json({ success: true, notification });
});

router.get('/admin/smtp/history', requireAuth, requireAdmin, async (_req, res) => {
  const messages = await db.select().from(emailMessages).orderBy(desc(emailMessages.createdAt)).limit(500);
  res.json({ success: true, messages: messages.map(({ bodyHtml, ...safe }) => safe) });
});

router.post('/admin/smtp/messages/:id/retry', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [message] = await db.select().from(emailMessages).where(eq(emailMessages.id, id)).limit(1);
  if (!message) return res.status(404).json({ success: false, error: 'E-mail não encontrado.' });
  if (!['FAILED', 'CANCELLED'].includes(message.status || '')) return res.status(409).json({ success: false, error: 'Este e-mail não pode ser reenviado nesse estado.' });
  const [copy] = await db.insert(emailMessages).values({
    userId: message.userId,
    notificationId: message.notificationId,
    templateId: message.templateId,
    recipientEmail: message.recipientEmail,
    recipientName: message.recipientName,
    subject: message.subject,
    bodyHtml: message.bodyHtml,
    bodyText: message.bodyText,
    status: 'PENDING',
    priority: message.priority,
    scheduledAt: new Date(),
  }).$returningId();
  if (message.notificationId && message.userId) {
    await db.insert(notificationDeliveryQueue).values({
      notificationId: message.notificationId,
      userId: message.userId,
      channel: 'EMAIL',
      status: 'PENDING',
      scheduledAt: new Date(),
      destinationReference: String(copy.id),
    });
  }
  res.json({ success: true, id: copy.id });
});

router.post('/admin/smtp/messages/:id/cancel', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.update(emailMessages).set({ status: 'CANCELLED' }).where(and(eq(emailMessages.id, id), inArray(emailMessages.status, ['PENDING', 'RETRY_PENDING'])));
  res.json({ success: true });
});

router.get('/admin/notification-automations', requireAuth, requireAdmin, async (_req, res) => {
  res.json({ success: true, rules: await db.select().from(notificationAutomationRules) });
});

router.put('/admin/notification-automations/:id', requireAuth, requireAdmin, async (req, res) => {
  const values = {
    isActive: Boolean(req.body.isActive),
    inAppEnabled: Boolean(req.body.inAppEnabled),
    pushEnabled: Boolean(req.body.pushEnabled),
    emailEnabled: Boolean(req.body.emailEnabled),
    emailDelayMinutes: Math.max(0, Number(req.body.emailDelayMinutes) || 0),
    pushDelayMinutes: Math.max(0, Number(req.body.pushDelayMinutes) || 0),
    priority: String(req.body.priority || 'NORMAL'),
  };
  await db.update(notificationAutomationRules).set(values).where(eq(notificationAutomationRules.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get('/admin/notification-templates', requireAuth, requireAdmin, async (_req, res) => {
  res.json({ success: true, templates: await db.select().from(notificationTemplates).orderBy(desc(notificationTemplates.updatedAt)) });
});

router.get('/admin/notification-templates/:id', requireAuth, requireAdmin, async (req, res) => {
  const [template] = await db.select().from(notificationTemplates).where(eq(notificationTemplates.id, Number(req.params.id))).limit(1);
  if (!template) return res.status(404).json({ success: false, error: 'Template não encontrado.' });
  res.json({ success: true, template });
});

router.put('/admin/notification-templates/:id', requireAuth, requireAdmin, async (req, res) => {
  const values = {
    name: String(req.body.name || '').slice(0, 255),
    subject: req.body.subject ? String(req.body.subject).slice(0, 255) : null,
    title: req.body.title ? String(req.body.title).slice(0, 255) : null,
    bodyHtml: req.body.bodyHtml ? String(req.body.bodyHtml).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') : null,
    bodyText: req.body.bodyText ? String(req.body.bodyText) : null,
    actionLabel: req.body.actionLabel ? String(req.body.actionLabel).slice(0, 100) : null,
    actionUrlTemplate: req.body.actionUrlTemplate ? internalUrl(req.body.actionUrlTemplate) : null,
    isActive: Boolean(req.body.isActive),
    version: sql`${notificationTemplates.version} + 1`,
  };
  await db.update(notificationTemplates).set(values).where(eq(notificationTemplates.id, Number(req.params.id)));
  res.json({ success: true });
});

router.post('/admin/notification-templates/:id/preview', requireAuth, requireAdmin, async (req, res) => {
  const [template] = await db.select().from(notificationTemplates).where(eq(notificationTemplates.id, Number(req.params.id))).limit(1);
  if (!template) return res.status(404).json({ success: false, error: 'Template não encontrado.' });
  const variables = typeof req.body?.variables === 'object' && req.body.variables ? req.body.variables : {};
  const render = (value?: string | null) => (value || '').replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key) => String(variables[key] ?? `{{${key}}}`));
  res.json({ success: true, preview: { subject: render(template.subject), title: render(template.title), bodyHtml: render(template.bodyHtml), bodyText: render(template.bodyText), actionUrl: render(template.actionUrlTemplate) } });
});

export default router;
