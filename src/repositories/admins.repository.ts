import { desc, eq, ilike } from 'drizzle-orm';
import { db } from '../infrastructure/database/drizzle';
import {
  admins,
  customers,
  photos,
  photoSessions,
} from '../infrastructure/database/schemas';
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

const getAllCustomers = async (email?: string) => {
  const query = db
    .select({
      photoSessions: {
        id: photoSessions.id,
        zipUrl: photoSessions.zipUrl,
      },
      customer: {
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phoneNumber: customers.phoneNumber,
        instagramUsername: customers.instagramUsername,
        major: customers.major,
        npm: customers.npm,
      },
    })
    .from(customers)
    .leftJoin(photoSessions, eq(photoSessions.id, customers.sessionId));

  if (email) {
    query.where(ilike(customers.email, `%${email}%`));
  }

  const customersData = await query.orderBy(desc(customers.createdAt));
  return customersData.map((c) => ({
    sessionId: c.photoSessions?.id,
    zipUrl: c.photoSessions?.zipUrl,
    ...c.customer,
  }));
};

const getAllSession = async () => {
  const data = await db
    .select({
      customer: {
        id: customers.id,
        name: customers.name,
        email: customers.email,
        npm: customers.npm,
        major: customers.major,
        phoneNumber: customers.phoneNumber,
        instagramUsername: customers.instagramUsername,
      },
      photo: {
        id: photos.id,
        fileName: photos.fileName,
        fileUrl: photos.fileUrl,
      },
      photoSession: {
        id: photoSessions.id,
        zipUrl: photoSessions.zipUrl,
      },
    })
    .from(photoSessions)
    .leftJoin(photos, eq(photoSessions.id, photos.sessionId))
    .leftJoin(customers, eq(customers.sessionId, photoSessions.id))
    .groupBy(photoSessions.id, customers.id, photos.id)
    .orderBy(desc(customers.createdAt));
  return data;
};

export const adminsRepository = {
  createAdmin,
  adminLogin,
  getAdminLogin,
  adminLogOut,
  getAllCustomers,
  getAllSession,
};
