import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Batasi setiap IP maksimal 100 request per windowMs
  message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.',
});
