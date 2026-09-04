import z from 'zod';
import { isRealEmail } from '../utils/emailValidator.js';

export const emailActiveValidation = z
  .email('Format email tidak valid')
  .trim()
  .refine(async (val) => await isRealEmail(val), {
    message: 'Email tidak aktif atau menggunakan domain sekali pakai!',
  });

export const passwordSchema = z
  .string('Password tidak valid')
  .min(8, 'Password minimal 8 karakter')
  .regex(/[a-zA-Z]/, 'Password harus mengandung huruf')
  .regex(/\d/, 'Password harus mengandung angka')
  .regex(/\W/, 'Password harus mengandung karakter khusus');
