import { desc, eq } from 'drizzle-orm';
import { db } from '../infrastructure/database/drizzle.ts';
import { customers } from '../infrastructure/database/schemas.ts';
import type { InsertCustomersType } from '../types/customers.d.ts';

const createCustomer = async (data: InsertCustomersType) => {
  const [result] = await db.insert(customers).values(data).returning();
  return result;
};

const findEmailCustomer = async (email: string) => {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.email, email));
  return customer;
};

export const customersRepository = {
  createCustomer,
  findEmailCustomer,
};
