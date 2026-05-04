import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Hash a password using scrypt (Node.js built-in).
 * Returns "salt:hash" format.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored "salt:hash" string.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, 'hex');
  const derivedKey = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuffer, derivedKey);
}
