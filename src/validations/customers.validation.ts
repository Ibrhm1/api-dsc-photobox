import z from 'zod';

const createCustomerValidation = z.object({
  name: z
    .string('Nama harus berupa string')
    .min(1, 'Nama wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  email: z.email('Format email tidak valid').trim(),
  npm: z
    .string('NPM harus berupa string')
    .min(1, 'NPM wajib diisi')
    .max(15, 'NPM maksimal 15 karakter'),
  phoneNumber: z
    .string()
    .trim()
    .min(8, 'Nomor telepon terlalu pendek! (minimal 8 angka)')
    .max(15, 'Nomor telepon terlalu panjang! (maksimal 15 angka)')
    .regex(/^[0-9+]+$/, 'Nomor telepon hanya boleh berisi angka dan awalan +')
    .optional(),
  major: z.string('Jurusan wajib diisi').min(1, 'Jurusan wajib diisi'),
  instagramUsername: z
    .string('Username Instagram harus berupa string')
    .trim()
    .transform((val) => val.replace(/^@/, ''))
    .refine((val) => /^[a-zA-Z0-9._]+$/.test(val), {
      message:
        'Username Instagram hanya boleh huruf, angka, titik, atau underscore!',
    }),
});

const queryParamsCustomerValidation = z.object({
  sessionId: z
    .string('Session ID harus berupa string')
    .min(1, 'Session ID tidak boleh kosong'),
});

export const customersValidation = {
  createCustomerValidation,
  queryParamsCustomerValidation,
};
