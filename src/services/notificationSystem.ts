import crypto from 'crypto';
import nodemailer from 'nodemailer';
import webpush from 'web-push';
import { and, asc, eq, inArray, lte, or, sql } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  emailMessages,
  eventReminders,
  notificationAutomationRules,
  notificationDeliveries,
  notificationDeliveryQueue,
  notificationPreferences,
  pushNotificationSettings,
  pushSubscriptions,
  smtpSettings,
  userNotifications,
  users,
  weddingEvents,
} from '../db/schema.ts';
import { SecureCredentialsService } from './secureCredentialsService.ts';

export type NotificationChannel = 'IN_APP' | 'PUSH' | 'EMAIL';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationEvent {
  eventType: string;
  userId: number;
  userType: string;
  title: string;
  message: string;
  category?: string;
  priority?: NotificationPriority;
  actionUrl?: string | null;
  resourceType?: string | null;
  resourceId?: number | null;
  metadata?: Record<string, unknown>;
  deduplicationKey?: string;
}

const mandatoryEvents = new Set([
  'SECURITY_ALERT',
  'PASSWORD_CHANGED',
  'EMAIL_CONFIRMATION',
  'PAYMENT_APPROVED',
  'PAYMENT_REJECTED',
  'SUBSCRIPTION_CANCELLED',
  'ACCOUNT_SUSPENDED',
]);

function safeInternalUrl(value?: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/notificacoes';
  return value;
}

function retryDate(attempt: number): Date {
  const minutes = [0, 1, 5, 30, 120][Math.min(attempt, 4)];
  return new Date(Date.now() + minutes * 60_000);
}

export class NotificationPreferenceService {
  static async channelsFor(userId: number, userType: string, eventType: string) {
    const [preference] = await db
      .select()
      .from(notificationPreferences)
      .where(and(eq(notificationPreferences.userId, userId), eq(notificationPreferences.eventType, eventType)))
      .limit(1);

    const [rule] = await db
      .select()
      .from(notificationAutomationRules)
      .where(
        and(
          eq(notificationAutomationRules.eventType, eventType),
          or(eq(notificationAutomationRules.userType, userType), eq(notificationAutomationRules.userType, 'ALL')),
        ),
      )
      .limit(1);

    const mandatory = mandatoryEvents.has(eventType);
    return {
      active: rule?.isActive !== false || mandatory,
      inApp: mandatory || (preference?.inAppEnabled ?? rule?.inAppEnabled ?? true),
      push: preference?.pushEnabled ?? rule?.pushEnabled ?? true,
      email: mandatory || (preference?.emailEnabled ?? rule?.emailEnabled ?? true),
      pushDelayMinutes: rule?.pushDelayMinutes || 0,
      emailDelayMinutes: rule?.emailDelayMinutes || 0,
    };
  }
}

export class NotificationService {
  static async create(event: NotificationEvent) {
    const channels = await NotificationPreferenceService.channelsFor(event.userId, event.userType, event.eventType);
    if (!channels.active) return null;

    if (event.deduplicationKey) {
      const [existing] = await db
        .select()
        .from(userNotifications)
        .where(
          and(
            eq(userNotifications.userId, event.userId),
            sql`JSON_UNQUOTE(JSON_EXTRACT(${userNotifications.metadataJson}, '$.deduplicationKey')) = ${event.deduplicationKey}`,
          ),
        )
        .limit(1);
      if (existing) return existing;
    }

    const metadata = { ...(event.metadata || {}), deduplicationKey: event.deduplicationKey || null };
    const [result] = await db.insert(userNotifications).values({
      userId: event.userId,
      userType: event.userType,
      eventType: event.eventType,
      category: event.category || 'SYSTEM',
      title: event.title,
      message: event.message,
      actionUrl: safeInternalUrl(event.actionUrl),
      resourceType: event.resourceType || null,
      resourceId: event.resourceId || null,
      priority: event.priority || 'NORMAL',
      metadataJson: metadata,
    }).$returningId();

    const notificationId = result.id;
    const now = Date.now();
    const queueRows: Array<typeof notificationDeliveryQueue.$inferInsert> = [];
    if (channels.inApp) {
      queueRows.push({ notificationId, userId: event.userId, channel: 'IN_APP', status: 'SENT', sentAt: new Date() });
    }
    if (channels.push) {
      queueRows.push({
        notificationId,
        userId: event.userId,
        channel: 'PUSH',
        scheduledAt: new Date(now + channels.pushDelayMinutes * 60_000),
      });
    }
    if (channels.email) {
      queueRows.push({
        notificationId,
        userId: event.userId,
        channel: 'EMAIL',
        scheduledAt: new Date(now + channels.emailDelayMinutes * 60_000),
      });
    }
    if (queueRows.length) await db.insert(notificationDeliveryQueue).values(queueRows);
    return { id: notificationId, ...event };
  }
}

export class NotificationEventService {
  static emit(event: NotificationEvent) {
    return NotificationService.create(event);
  }
}

async function loadPushConfiguration() {
  const [settings] = await db.select().from(pushNotificationSettings).limit(1);
  if (!settings?.isEnabled || !settings.vapidPublicKey || !settings.vapidPrivateKeyEncrypted) return null;
  const privateKey = SecureCredentialsService.decrypt(settings.vapidPrivateKeyEncrypted);
  webpush.setVapidDetails(settings.vapidSubject || 'mailto:contato@guiadefotografocasamento.com.br', settings.vapidPublicKey, privateKey);
  return settings;
}

export class PushNotificationService {
  static async send(userId: number, notification: typeof userNotifications.$inferSelect) {
    const settings = await loadPushConfiguration();
    if (!settings) throw new Error('Web Push não configurado');
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.isActive, true)));
    if (!subscriptions.length) return { sent: 0, failed: 0, skipped: true };

    let sent = 0;
    let failed = 0;
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dhKey, auth: subscription.authKey },
          },
          JSON.stringify({
            notificationId: notification.id,
            title: notification.title,
            body: notification.message,
            icon: settings.defaultIconUrl || '/icons/icon-192.png',
            badge: settings.defaultBadgeUrl || '/icons/badge-96.png',
            url: safeInternalUrl(notification.actionUrl),
            tag: `${notification.eventType || 'notification'}-${notification.resourceId || notification.id}`,
            data: { type: notification.eventType, resourceId: notification.resourceId },
          }),
        );
        sent += 1;
        await db.update(pushSubscriptions).set({ lastSuccessAt: new Date(), failureCount: 0 }).where(eq(pushSubscriptions.id, subscription.id));
      } catch (error: any) {
        failed += 1;
        const expired = error?.statusCode === 404 || error?.statusCode === 410;
        await db.update(pushSubscriptions).set({
          lastFailureAt: new Date(),
          failureCount: sql`${pushSubscriptions.failureCount} + 1`,
          ...(expired ? { isActive: false, revokedAt: new Date() } : {}),
        }).where(eq(pushSubscriptions.id, subscription.id));
      }
    }
    return { sent, failed, skipped: false };
  }
}

async function smtpTransport() {
  const [settings] = await db.select().from(smtpSettings).where(eq(smtpSettings.isEnabled, true)).limit(1);
  if (!settings?.host || !settings.usernameEncrypted || !settings.passwordEncrypted) return null;
  return {
    settings,
    transport: nodemailer.createTransport({
      host: settings.host,
      port: settings.port || 587,
      secure: settings.secureMode === 'SSL_TLS',
      requireTLS: settings.secureMode === 'STARTTLS',
      connectionTimeout: settings.connectionTimeoutMs || 10_000,
      greetingTimeout: settings.connectionTimeoutMs || 10_000,
      socketTimeout: settings.sendTimeoutMs || 15_000,
      auth: {
        user: SecureCredentialsService.decrypt(settings.usernameEncrypted),
        pass: SecureCredentialsService.decrypt(settings.passwordEncrypted),
      },
    }),
  };
}

export class EmailNotificationService {
  static async verify() {
    const configured = await smtpTransport();
    if (!configured) throw new Error('SMTP não configurado');
    await configured.transport.verify();
  }

  static async send(userId: number, notification: typeof userNotifications.$inferSelect) {
    const configured = await smtpTransport();
    if (!configured) throw new Error('SMTP não configurado');
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user?.email) return { skipped: true };
    const actionUrl = safeInternalUrl(notification.actionUrl);
    const bodyText = `${notification.message}\n\nAcesse: ${actionUrl}`;
    const bodyHtml = `<div style="font-family:Arial,sans-serif;color:#5A4035"><h2>${notification.title}</h2><p>${notification.message}</p><p><a href="${actionUrl}">Abrir no Guia Casamento</a></p></div>`;
    const [message] = await db.insert(emailMessages).values({
      userId,
      notificationId: notification.id,
      recipientEmail: user.email,
      recipientName: user.name,
      subject: notification.title,
      bodyText,
      bodyHtml,
      status: 'PROCESSING',
      processingStartedAt: new Date(),
    }).$returningId();
    try {
      const result = await configured.transport.sendMail({
        from: { name: configured.settings.fromName || 'Guia Fotógrafo Casamento', address: configured.settings.fromEmail || user.email },
        replyTo: configured.settings.replyToEmail || undefined,
        to: { name: user.name, address: user.email },
        subject: notification.title,
        text: bodyText,
        html: bodyHtml,
      });
      await db.update(emailMessages).set({ status: 'SENT', sentAt: new Date(), providerMessageId: result.messageId }).where(eq(emailMessages.id, message.id));
      return { skipped: false, messageId: result.messageId };
    } catch (error: any) {
      await db.update(emailMessages).set({ status: 'FAILED', failedAt: new Date(), errorMessage: String(error?.message || error).slice(0, 1000) }).where(eq(emailMessages.id, message.id));
      throw error;
    }
  }
}

export class NotificationDeliveryWorker {
  private running = false;

  async runOnce(batchSize = 25) {
    if (this.running) return;
    this.running = true;
    try {
      const jobs = await db
        .select()
        .from(notificationDeliveryQueue)
        .where(
          and(
            inArray(notificationDeliveryQueue.status, ['PENDING', 'RETRY_PENDING']),
            lte(notificationDeliveryQueue.scheduledAt, new Date()),
          ),
        )
        .orderBy(asc(notificationDeliveryQueue.scheduledAt))
        .limit(batchSize);

      for (const job of jobs) {
        const claimed = await db.update(notificationDeliveryQueue).set({
          status: 'PROCESSING',
          processingStartedAt: new Date(),
          attempts: sql`${notificationDeliveryQueue.attempts} + 1`,
        }).where(and(eq(notificationDeliveryQueue.id, job.id), inArray(notificationDeliveryQueue.status, ['PENDING', 'RETRY_PENDING'])));
        if (!(claimed as any)[0]?.affectedRows) continue;

        const [notification] = job.notificationId
          ? await db.select().from(userNotifications).where(eq(userNotifications.id, job.notificationId)).limit(1)
          : [];
        if (!notification || !job.userId) {
          await db.update(notificationDeliveryQueue).set({ status: 'SKIPPED' }).where(eq(notificationDeliveryQueue.id, job.id));
          continue;
        }

        try {
          if (job.channel === 'PUSH') await PushNotificationService.send(job.userId, notification);
          if (job.channel === 'EMAIL') await EmailNotificationService.send(job.userId, notification);
          await db.update(notificationDeliveryQueue).set({ status: 'SENT', sentAt: new Date(), errorCode: null, errorMessage: null }).where(eq(notificationDeliveryQueue.id, job.id));
          await db.insert(notificationDeliveries).values({
            notificationId: notification.id,
            userId: job.userId,
            channel: job.channel,
            status: 'SENT',
            attempts: (job.attempts || 0) + 1,
            sentAt: new Date(),
          });
        } catch (error: any) {
          const attempt = (job.attempts || 0) + 1;
          const failed = attempt >= (job.maxAttempts || 5);
          await db.update(notificationDeliveryQueue).set({
            status: failed ? 'FAILED' : 'RETRY_PENDING',
            failedAt: failed ? new Date() : null,
            nextRetryAt: failed ? null : retryDate(attempt),
            scheduledAt: failed ? job.scheduledAt : retryDate(attempt),
            errorCode: error?.code || 'DELIVERY_ERROR',
            errorMessage: String(error?.message || error).slice(0, 1000),
          }).where(eq(notificationDeliveryQueue.id, job.id));
        }
      }
    } finally {
      this.running = false;
    }
  }
}

export class EventReminderService {
  private running = false;

  async runOnce() {
    if (this.running) return;
    this.running = true;
    try {
      const now = new Date();
      const horizon = new Date(now.getTime() + 25 * 60 * 60_000);
      const events = await db.select().from(weddingEvents)
        .where(and(eq(weddingEvents.reminderEnabled, true), eq(weddingEvents.status, 'scheduled'), sql`${weddingEvents.deletedAt} IS NULL`));

      for (const event of events) {
        const startsAt = event.startAt ? new Date(event.startAt) : null;
        if (!startsAt || Number.isNaN(startsAt.getTime())) continue;
        const remindAt = new Date(startsAt.getTime() - (event.reminderMinutes || 1440) * 60_000);
        if (remindAt > horizon || startsAt <= now) continue;
        const [existing] = await db.select().from(eventReminders)
          .where(and(eq(eventReminders.eventId, event.id), eq(eventReminders.reminderType, 'CONFIGURED')))
          .limit(1);
        if (!existing) {
          await db.insert(eventReminders).values({
            eventId: event.id,
            userId: event.userId,
            reminderType: 'CONFIGURED',
            remindAt,
            channelsJson: ['IN_APP', 'PUSH', 'EMAIL'],
            status: 'SCHEDULED',
          });
        } else if (existing.status === 'SCHEDULED' && existing.remindAt.getTime() !== remindAt.getTime()) {
          await db.update(eventReminders).set({ remindAt }).where(eq(eventReminders.id, existing.id));
        }
      }

      const due = await db.select().from(eventReminders)
        .where(and(eq(eventReminders.status, 'SCHEDULED'), lte(eventReminders.remindAt, now)))
        .limit(50);
      for (const reminder of due) {
        const [event] = await db.select().from(weddingEvents).where(eq(weddingEvents.id, reminder.eventId)).limit(1);
        if (!event || event.deletedAt || event.status !== 'scheduled') {
          await db.update(eventReminders).set({ status: 'CANCELLED', cancelledAt: new Date() }).where(eq(eventReminders.id, reminder.id));
          continue;
        }
        await NotificationEventService.emit({
          eventType: 'AGENDA_REMINDER',
          userId: reminder.userId,
          userType: 'BRIDE',
          title: 'Lembrete da sua agenda',
          message: `${event.title} está próximo${event.location ? ` — ${event.location}` : ''}.`,
          category: 'AGENDA',
          priority: 'HIGH',
          actionUrl: '/portal-do-casal',
          resourceType: 'WEDDING_EVENT',
          resourceId: event.id,
          deduplicationKey: `event-reminder-${reminder.id}`,
        });
        await db.update(eventReminders).set({ status: 'SENT', sentAt: new Date() }).where(eq(eventReminders.id, reminder.id));
      }
    } finally {
      this.running = false;
    }
  }
}

export const notificationDeliveryWorker = new NotificationDeliveryWorker();
export const eventReminderService = new EventReminderService();

export function endpointHash(endpoint: string) {
  return crypto.createHash('sha256').update(endpoint).digest('hex');
}

export function publicPushSettings(row: typeof pushNotificationSettings.$inferSelect | undefined) {
  if (!row) return null;
  const { vapidPrivateKeyEncrypted: _private, ...safe } = row;
  return { ...safe, privateKeyConfigured: Boolean(_private) };
}
