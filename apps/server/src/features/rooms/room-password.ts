import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

export interface RoomPasswordRecord {
  salt: string;
  hash: string;
}

export function hashRoomPassword(password: string): RoomPasswordRecord {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');

  return { salt, hash };
}

export function verifyRoomPassword(password: string, record: RoomPasswordRecord): boolean {
  const candidate = scryptSync(password, record.salt, KEY_LENGTH);

  try {
    return timingSafeEqual(candidate, Buffer.from(record.hash, 'hex'));
  } catch {
    return false;
  }
}
