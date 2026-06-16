import pino from 'pino';

export const logger = pino({
  name: 'tandem-server',
  level: process.env.LOG_LEVEL ?? 'info',
});
