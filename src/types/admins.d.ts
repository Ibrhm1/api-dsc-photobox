import { admins } from '../infrastructure/database/schemas.ts';

export type AdminType = typeof admins.$inferSelect;

export type RegisterAdminType = Pick<AdminType, 'email'> & {
  password: string;
  confirmPassword: string;
};

export type LoginAdminType = Pick<RegisterAdminType, 'email' | 'password'> & {
  lastLogin: Date;
};

export type InsertAdminType = typeof admins.$inferInsert &
  Pick<RegisterAdminType, 'password'>;
