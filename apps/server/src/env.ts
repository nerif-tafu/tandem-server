import { z } from 'zod';

import { DEV_SERVER_PORT, ROOM_TTL_SECONDS_DEFAULT } from '@tandem/shared';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(DEV_SERVER_PORT),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),
  ROOM_TTL_SECONDS: z.coerce.number().default(ROOM_TTL_SECONDS_DEFAULT),
  LIVEKIT_URL: z.string().default('ws://localhost:7880'),
  LIVEKIT_PUBLIC_URL: z.string().optional(),
  LIVEKIT_API_KEY: z.string().default('devkey'),
  LIVEKIT_API_SECRET: z.string().default('secret'),
  CORS_ORIGINS: z.string().default('http://127.0.0.1:5173,http://localhost:5173'),
  STATIC_WEB_DIR: z.string().optional(),
  DESKTOP_RELEASES_REPO: z.string().default('nerif-tafu/tandem-desktop'),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return EnvSchema.parse({
    ...source,
    CORS_ORIGINS: source.CORS_ORIGINS,
  });
}

export function getCorsOrigins(env: Env): string[] {
  return env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
}

const LOCAL_DEV_ORIGIN_PATTERN = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/;
const LAN_DEV_ORIGIN_PATTERN =
  /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;
const TAURI_ORIGINS = ['https://tauri.localhost', 'tauri://localhost'] as const;

export function isAllowedCorsOrigin(env: Env, origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }

  if (
    env.NODE_ENV === 'development' &&
    (LOCAL_DEV_ORIGIN_PATTERN.test(origin) || LAN_DEV_ORIGIN_PATTERN.test(origin))
  ) {
    return true;
  }

  if (TAURI_ORIGINS.includes(origin as (typeof TAURI_ORIGINS)[number])) {
    return true;
  }

  return getCorsOrigins(env).includes(origin);
}

export function resolveCorsOrigin(env: Env, origin: string | undefined): string | undefined {
  if (!origin) {
    return undefined;
  }

  return isAllowedCorsOrigin(env, origin) ? origin : undefined;
}
