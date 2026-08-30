import app from './app';
import { logger } from './infrastructure/logging/logger';
import { env } from './utils/env';

const server = app.listen(env.PORT, () => {
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
