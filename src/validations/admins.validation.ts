import z from 'zod';
import { emailActiveValidation, passwordSchema } from './global.validation.ts';

const registerAdminValidation = z.object({
  email: emailActiveValidation,
  password: passwordSchema,
  confirmPassword: passwordSchema,
});

const loginAdminValidation = registerAdminValidation.omit({
  confirmPassword: true,
});

export const adminsValidation = {
  registerAdminValidation,
  loginAdminValidation,
};
