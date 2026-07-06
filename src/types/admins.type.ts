import { admins } from '../infrastructure/database/schemas';

export type RegisterAdminType = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginAdminType = Pick<RegisterAdminType, 'email' | 'password'> & {
  lastLogin: Date;
};

export type InsertAdminType = typeof admins.$inferInsert &
  Pick<RegisterAdminType, 'password'>;
