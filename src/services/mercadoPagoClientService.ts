import { eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { paymentGatewaySettings } from '../db/schema.ts';
import { SecureCredentialsService } from './secureCredentialsService.ts';

export class MercadoPagoClientService {
  /**
   * Get or initialize Mercado Pago settings record
   */
  static async getSettings() {
    const rows = await db
      .select()
      .from(paymentGatewaySettings)
      .where(eq(paymentGatewaySettings.provider, 'MERCADO_PAGO'));

    if (rows.length > 0) {
      return rows[0];
    }

    // Initialize default row if missing
    const defaultToken = `mp_token_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 8)}`;
    const [inserted] = await db.insert(paymentGatewaySettings).values({
      provider: 'MERCADO_PAGO',
      isEnabled: true,
      environment: 'TEST',
      webhookPathToken: defaultToken,
    });

    const newRows = await db
      .select()
      .from(paymentGatewaySettings)
      .where(eq(paymentGatewaySettings.provider, 'MERCADO_PAGO'));

    return newRows[0];
  }

  /**
   * Get decrypted credentials for active environment or specified environment
   */
  static async getActiveCredentials(envOverride?: 'TEST' | 'PRODUCTION') {
    const settings = await this.getSettings();
    const env = envOverride || (settings.environment as 'TEST' | 'PRODUCTION') || 'TEST';

    const isProd = env === 'PRODUCTION';

    const rawPublicKey = isProd ? settings.productionPublicKeyEncrypted : settings.testPublicKeyEncrypted;
    const rawAccessToken = isProd ? settings.productionAccessTokenEncrypted : settings.testAccessTokenEncrypted;
    const rawClientId = isProd ? settings.productionClientIdEncrypted : settings.testClientIdEncrypted;
    const rawClientSecret = isProd ? settings.productionClientSecretEncrypted : settings.testClientSecretEncrypted;
    const rawWebhookSecret = isProd ? settings.productionWebhookSecretEncrypted : settings.testWebhookSecretEncrypted;

    const publicKey = rawPublicKey ? SecureCredentialsService.decrypt(rawPublicKey) : '';
    const accessToken = rawAccessToken ? SecureCredentialsService.decrypt(rawAccessToken) : '';
    const clientId = rawClientId ? SecureCredentialsService.decrypt(rawClientId) : '';
    const clientSecret = rawClientSecret ? SecureCredentialsService.decrypt(rawClientSecret) : '';
    const webhookSecret = rawWebhookSecret ? SecureCredentialsService.decrypt(rawWebhookSecret) : '';

    return {
      environment: env,
      isEnabled: Boolean(settings.isEnabled),
      webhookPathToken: settings.webhookPathToken || '',
      publicKey,
      accessToken,
      clientId,
      clientSecret,
      webhookSecret,
      maskedPublicKey: SecureCredentialsService.mask(publicKey),
      maskedAccessToken: SecureCredentialsService.mask(accessToken),
      maskedWebhookSecret: SecureCredentialsService.mask(webhookSecret),
    };
  }

  /**
   * Test API connection with Mercado Pago
   */
  static async testConnection(envOverride?: 'TEST' | 'PRODUCTION') {
    const creds = await this.getActiveCredentials(envOverride);

    if (!creds.accessToken) {
      return {
        success: false,
        environment: creds.environment,
        message: 'Access Token não configurado para o ambiente ' + creds.environment,
      };
    }

    try {
      const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          environment: creds.environment,
          statusCode: response.status,
          message: `Falha na autenticação (HTTP ${response.status}): ${errorText.substring(0, 150)}`,
        };
      }

      const paymentMethods = await response.json();

      // Update last test status in database
      const settings = await this.getSettings();
      await db
        .update(paymentGatewaySettings)
        .set({
          lastConnectionTestAt: new Date(),
          lastConnectionTestStatus: 'SUCCESS',
          lastConnectionTestMessage: `Conexão bem sucedida (${paymentMethods?.length || 0} métodos de pagamento disponíveis)`,
          updatedAt: new Date(),
        })
        .where(eq(paymentGatewaySettings.id, settings.id));

      return {
        success: true,
        environment: creds.environment,
        message: 'Conexão validada com sucesso com a API do Mercado Pago.',
        paymentMethodsCount: Array.isArray(paymentMethods) ? paymentMethods.length : 0,
        testedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      const settings = await this.getSettings();
      await db
        .update(paymentGatewaySettings)
        .set({
          lastConnectionTestAt: new Date(),
          lastConnectionTestStatus: 'ERROR',
          lastConnectionTestMessage: `Erro na conexão: ${err.message}`,
          updatedAt: new Date(),
        })
        .where(eq(paymentGatewaySettings.id, settings.id));

      return {
        success: false,
        environment: creds.environment,
        message: `Erro ao conectar com Mercado Pago: ${err.message}`,
      };
    }
  }

  /**
   * Create recurring preapproval (subscription) in Mercado Pago
   */
  static async createSubscription(params: {
    title: string;
    amount: number;
    billingCycle: 'MONTHLY' | 'YEARLY';
    payerEmail: string;
    externalReference: string;
    backUrl: string;
  }) {
    const creds = await this.getActiveCredentials();

    if (!creds.accessToken) {
      throw new Error(`Access Token do Mercado Pago não configurado para o ambiente ${creds.environment}`);
    }

    const isYearly = params.billingCycle === 'YEARLY';

    const payload = {
      reason: params.title,
      auto_recurring: {
        frequency: isYearly ? 12 : 1,
        frequency_type: 'months',
        transaction_amount: Number(params.amount.toFixed(2)),
        currency_id: 'BRL',
      },
      back_url: params.backUrl,
      payer_email: params.payerEmail,
      external_reference: params.externalReference,
      status: 'authorized',
    };

    const res = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Erro Mercado Pago [${res.status}]: ${data.message || data.error || JSON.stringify(data)}`);
    }

    return {
      id: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point || data.init_point,
      checkoutUrl: creds.environment === 'PRODUCTION' ? data.init_point : (data.sandbox_init_point || data.init_point),
      status: data.status, // e.g. 'pending', 'authorized'
      externalReference: data.external_reference,
      payerEmail: data.payer_email,
    };
  }

  /**
   * Get subscription / preapproval detail from Mercado Pago
   */
  static async getSubscription(preapprovalId: string) {
    const creds = await this.getActiveCredentials();

    if (!creds.accessToken) {
      throw new Error('Access Token não configurado.');
    }

    const res = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Erro ao consultar assinatura MP: ${data.message || JSON.stringify(data)}`);
    }

    return data;
  }

  /**
   * Cancel subscription / preapproval in Mercado Pago
   */
  static async cancelSubscription(preapprovalId: string) {
    const creds = await this.getActiveCredentials();

    if (!creds.accessToken) {
      throw new Error('Access Token não configurado.');
    }

    const res = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Erro ao cancelar assinatura no Mercado Pago: ${data.message || JSON.stringify(data)}`);
    }

    return data;
  }

  /**
   * Reactivate subscription / preapproval in Mercado Pago
   */
  static async reactivateSubscription(preapprovalId: string) {
    const creds = await this.getActiveCredentials();

    if (!creds.accessToken) {
      throw new Error('Access Token não configurado.');
    }

    const res = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'authorized' }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Erro ao reativar assinatura no Mercado Pago: ${data.message || JSON.stringify(data)}`);
    }

    return data;
  }

  /**
   * Get payment details by ID
   */
  static async getPayment(paymentId: string) {
    const creds = await this.getActiveCredentials();

    if (!creds.accessToken) {
      throw new Error('Access Token não configurado.');
    }

    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Erro ao consultar pagamento MP: ${data.message || JSON.stringify(data)}`);
    }

    return data;
  }

  /**
   * Search payments by external reference
   */
  static async searchPayments(externalReference: string) {
    const creds = await this.getActiveCredentials();

    if (!creds.accessToken) {
      throw new Error('Access Token não configurado.');
    }

    const url = `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(externalReference)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Erro ao buscar pagamentos por referência: ${data.message || JSON.stringify(data)}`);
    }

    return data.results || [];
  }
}
