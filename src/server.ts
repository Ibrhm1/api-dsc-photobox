import app from './app';
import { logger } from './infrastructure/logging/logger';
import { env } from './utils/env';

app.listen(env.PORT, () => {
  const url = `http://${env.HOST}:${env.PORT}`;
  logger.info({ env: env.NODE_ENV, url }, 'Server berhasil berjalan');
});
