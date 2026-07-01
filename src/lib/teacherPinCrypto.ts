import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const PREFIX = 'scrypt$';

export function isHashedTeacherPin(stored: string): boolean {
  return stored.startsWith(PREFIX);
}

/** Hash a 6-digit teacher PIN for storage (server-only). */
export async function hashTeacherPin(pin: string): Promise<string> {
  const trimmed = pin.trim();
  const salt = randomBytes(16);
  const derived = (await scryptAsync(trimmed, salt, 32)) as Buffer;
  return `${PREFIX}${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

/** Verify PIN against stored hash or legacy plain text. */
export async function verifyTeacherPinValue(
  stored: string | null | undefined,
  pin: string
): Promise<boolean> {
  if (!stored || !pin.trim()) return false;
  const trimmed = pin.trim();

  if (!isHashedTeacherPin(stored)) {
    return stored === trimmed;
  }

  const body = stored.slice(PREFIX.length);
  const sep = body.lastIndexOf('$');
  if (sep <= 0) return false;

  const salt = Buffer.from(body.slice(0, sep), 'base64url');
  const expected = Buffer.from(body.slice(sep + 1), 'base64url');
  const derived = (await scryptAsync(trimmed, salt, 32)) as Buffer;

  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
