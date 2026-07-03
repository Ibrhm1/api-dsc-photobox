import { envSchema } from '../validations/env.validation';

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Environment variable tidak valid:');
  console.error(result.error.issues);
  process.exit(1);
}

export const env = result.data;
