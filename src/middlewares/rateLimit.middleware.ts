import rateLimit from 'express-rate-limit';
import { env } from '../utils/env';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: env.NODE_ENV === 'development' ? 1000 : 100, // Batasi setiap IP maksimal 100 request per windowMs
  message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.',
});
