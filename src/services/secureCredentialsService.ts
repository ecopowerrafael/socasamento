import crypto from 'crypto';

// Master key derived from environment variable or deterministic fallback for server lifecycle
const ENCRYPTION_KEY_ENV = process.env.PAYMENT_CREDENTIALS_ENCRYPTION_KEY
  || (process.env.NODE_ENV === 'production' ? '' : 'gfc_local_development_only_change_me');

function getDerivedKey(): Buffer {
  if (!ENCRYPTION_KEY_ENV) {
    throw new Error('PAYMENT_CREDENTIALS_ENCRYPTION_KEY deve ser configurada no ambiente de produção.');
  }
  return crypto.createHash('sha256').update(ENCRYPTION_KEY_ENV).digest();
}

export class SecureCredentialsService {
  /**
   * Encrypt plaintext string using AES-256-GCM
   */
  static encrypt(plainText: string): string {
    if (!plainText) return '';
    const key = getDerivedKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt AES-256-GCM encrypted string
   */
  static decrypt(cipherText: string): string {
    if (!cipherText) return '';
    try {
      const parts = cipherText.split(':');
      if (parts.length !== 3) {
        // Fallback if plain or invalid format
        return cipherText;
      }
      const [ivHex, authTagHex, encryptedHex] = parts;
      const key = getDerivedKey();
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      console.error('Error decrypting credential:', err);
      return '';
    }
  }

  /**
   * Safely mask credential for frontend display
   * Example: APP_USR-1234567890ABCDEF -> APP_USR-••••••••CDEF
   */
  static mask(value: string): string {
    if (!value) return '';
    const decrypted = value.includes(':') ? this.decrypt(value) : value;
    if (!decrypted) return '';

    if (decrypted.length <= 8) {
      return '••••••••' + decrypted.slice(-2);
    }

    if (decrypted.startsWith('APP_USR-')) {
      const prefix = 'APP_USR-';
      const lastFour = decrypted.slice(-4);
      return `${prefix}••••••••••••${lastFour}`;
    }

    if (decrypted.startsWith('TEST-')) {
      const prefix = 'TEST-';
      const lastFour = decrypted.slice(-4);
      return `${prefix}••••••••••••${lastFour}`;
    }

    const firstTwo = decrypted.slice(0, 3);
    const lastFour = decrypted.slice(-4);
    return `${firstTwo}••••••••${lastFour}`;
  }
}
