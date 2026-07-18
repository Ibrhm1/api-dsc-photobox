import rateLimit from 'express-rate-limit';

// Rate limiter global untuk seluruh aplikasi (maks 100 request per 15 menit)
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100,
  message: {
    status: 429,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter khusus otentikasi admin (maks 5 percobaan login/register per 15 menit)
export const adminAuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5,
  message: {
    status: 429,
    message: 'Terlalu banyak percobaan autentikasi dari IP ini, silakan coba lagi setelah 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
