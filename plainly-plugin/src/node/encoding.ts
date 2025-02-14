import crypto from 'crypto';

export function encode(secret: string, data: string) {
  const key = crypto.createHash('sha256').update(secret).digest(); // 32-byte key for AES-256

  const cipher = crypto.createCipheriv('aes-256-ecb', key, null); // No IV for ECB mode
  let encoded = cipher.update(data, 'utf8', 'hex');
  encoded += cipher.final('hex');

  return encoded;
}

export function decode(secret: string, encoded: string): string {
  const key = crypto.createHash('sha256').update(secret).digest();

  const decipher = crypto.createDecipheriv('aes-256-ecb', key, null); // No IV for ECB mode
  let decoded = decipher.update(encoded, 'hex', 'utf8');
  decoded += decipher.final('utf8');

  return decoded;
}
