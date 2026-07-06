import z from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number('PORT harus berupa angka'),
  HOST: z.string('HOST harus berupa string'),
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  BASE_URL: z.url('BASE_URL harus berupa URL'),
  ORIGIN_ALLOWED: z.url('ORIGIN_ALLOWED harus berupa URL'),
  DATABASE_URL: z.url('DATABASE_URL harus berupa URL'),
  SUPABASE_URL: z.url('SUPABASE_URL harus berupa URL'),
  SUPABASE_ANON_KEY: z.string('SUPABASE_ANON_KEY harus berupa string'),
  SUPABASE_JWT_SECRET: z.string('SUPABASE_JWT_SECRET harus berupa string'),
  REDIS_URL: z.url('REDIS_URL harus berupa URL'),
  // RABBITMQ_URL: z.url('RABBITMQ_URL harus berupa URL'),
  // MAIL_HOST: z.string('MAIL_HOST harus berupa string'),
  // MAIL_PORT: z.coerce.number('MAIL_PORT harus berupa angka'),
  // MAIL_USERNAME: z.string('MAIL_USERNAME harus berupa string'),
  // MAIL_PASSWORD: z.string('MAIL_PASSWORD harus berupa string'),
  // MAIL_FROM: z.string('MAIL_FROM harus berupa string'),
});
