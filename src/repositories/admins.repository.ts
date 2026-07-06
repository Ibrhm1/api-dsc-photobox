import { eq } from 'drizzle-orm';
import { db } from '../infrastructure/database/drizzle';
import { admins } from '../infrastructure/database/schemas';
import { supabase } from '../infrastructure/database/supabase';
import type { InsertAdminType, LoginAdminType } from '../types/admins.type';

const createAdmin = async (data: InsertAdminType) => {
  const { data: admin, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  return {
    admin: admin.session,
    error,
  };
};

const adminLogin = async (data: LoginAdminType) => {
  const {
    data: { session },
    error,
  } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { data: null, error };
  }

  const [updateLastLoginAdmin] = await db
    .update(admins)
    .set({
      lastLogin: data.lastLogin,
    })
    .where(eq(admins.email, session?.user.email!))
    .returning();

  return { data: { session, updateLastLoginAdmin }, error: null };
};

const getAdminLogin = async (id: string) => {
  const [data] = await db.select().from(admins).where(eq(admins.id, id));

  return data;
};

const adminLogOut = async () => {
  const { error } = await supabase.auth.signOut({
    scope: 'global',
  });

  return error;
};

export const adminsRepository = {
  createAdmin,
  adminLogin,
  getAdminLogin,
  adminLogOut,
};
