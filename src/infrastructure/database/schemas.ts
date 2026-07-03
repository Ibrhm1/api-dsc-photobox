import { relations } from 'drizzle-orm/_relations';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// ==========================================
// 1. DEFINISI TABEL (SKEMA FISIK)
// ==========================================

export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 50 }).notNull().unique(),
  lastLogin: timestamp('last_login', { precision: 6 }),
  createdAt: timestamp('created_at', { precision: 6 }).defaultNow().notNull(),
});

export const photoSessions = pgTable('photo_sessions', {
  id: varchar('id', { length: 100 }).primaryKey(),
  zipUrl: varchar('zip_url', { length: 255 }),
  createdAt: timestamp('createdAt', { precision: 6 }).defaultNow().notNull(),
});

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Foreign Key untuk Relasi One-to-One dengan Cascade Delete
  sessionId: varchar('session_id', { length: 100 })
    .notNull()
    .unique()
    .references(() => photoSessions.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 50 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  instagramUsername: varchar('instagram_username', { length: 50 }).notNull(),
  createdAt: timestamp('createdAt', { precision: 6 }).defaultNow().notNull(),
});

export const photos = pgTable('photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Foreign Key untuk Relasi One-to-Many dengan Cascade Delete
  sessionId: varchar('session_id', { length: 100 })
    .notNull()
    .references(() => photoSessions.id, { onDelete: 'cascade' }),
  folderName: varchar('folder_name', { length: 100 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 255 }).notNull(),
  createdAt: timestamp('createdAt', { precision: 6 }).defaultNow().notNull(),
});

// ==========================================
// 2. DEFINISI RELASI (UNTUK QUERY BUILDER)
// ==========================================

export const photoSessionsRelations = relations(
  photoSessions,
  ({ one, many }) => ({
    // Relasi ke Customer (One-to-One)
    customers: one(customers, {
      fields: [photoSessions.id],
      references: [customers.sessionId],
    }),
    // Relasi ke Photos (One-to-Many)
    photos: many(photos),
  }),
);

export const customersRelations = relations(customers, ({ one }) => ({
  photoSession: one(photoSessions, {
    fields: [customers.sessionId],
    references: [photoSessions.id],
  }),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  session: one(photoSessions, {
    fields: [photos.sessionId],
    references: [photoSessions.id],
  }),
}));
