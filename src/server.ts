import app from './app.ts';
import { logger } from './infrastructure/logging/logger.ts';
import { env } from './utils/env.ts';

export const server = app.listen(env.PORT, () => {
  const url = `http://${env.HOST}:${env.PORT}`;
  logger.info(
    { env: env.NODE_ENV, url, apiDoc: `${url}/api-docs` },
    'Server berhasil berjalan',
  );
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('Menerima signal SIGTERM, memulai graceful shutdown...');
  server.close(() => {
    logger.info('Server Express ditutup secara bersih.');
    process.exit(0);
  });
});
