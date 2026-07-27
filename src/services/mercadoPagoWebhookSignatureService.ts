import crypto from 'crypto';

export class MercadoPagoWebhookSignatureService {
  /**
   * Validate Mercado Pago webhook x-signature header
   */
  static validate(params: {
    xSignature: string | undefined;
    xRequestId: string | undefined;
    dataId: string | undefined;
    secret: string;
  }): { isValid: boolean; reason?: string } {
    const { xSignature, xRequestId, dataId, secret } = params;

    if (!secret) {
      return { isValid: false, reason: 'Segredo do webhook não configurado no servidor.' };
    }

    if (!xSignature) {
      return { isValid: false, reason: 'Header x-signature ausente na requisição.' };
    }

    // Extract ts and v1 from x-signature (format: ts=1700000000,v1=abc123def...)
    const parts = xSignature.split(',');
    let ts: string | undefined;
    let v1: string | undefined;

    for (const part of parts) {
      const [key, value] = part.trim().split('=');
      if (key === 'ts') ts = value;
      if (key === 'v1') v1 = value;
    }

    if (!ts || !v1) {
      return { isValid: false, reason: 'Header x-signature malformatado (ausente ts ou v1).' };
    }

    const resourceId = dataId || '';
    const reqId = xRequestId || '';

    // Manifest string: "id:DATA_ID;request-id:REQUEST_ID;ts:TS;"
    const manifest = `id:${resourceId};request-id:${reqId};ts:${ts};`;

    try {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(manifest);
      const computedHash = hmac.digest('hex');

      const computedBuffer = Buffer.from(computedHash, 'hex');
      const receivedBuffer = Buffer.from(v1, 'hex');

      if (computedBuffer.length !== receivedBuffer.length) {
        return { isValid: false, reason: 'Assinatura x-signature divergente.' };
      }

      const match = crypto.timingSafeEqual(computedBuffer, receivedBuffer);
      if (!match) {
        return { isValid: false, reason: 'Assinatura HMAC SHA256 não confere com o segredo.' };
      }

      return { isValid: true };
    } catch (err: any) {
      return { isValid: false, reason: `Erro ao computar hash HMAC: ${err.message}` };
    }
  }
}
