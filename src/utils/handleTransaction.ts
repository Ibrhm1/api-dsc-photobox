import { db } from '../infrastructure/database/drizzle.js';
import type { Transaction } from '../types/global.js';

type callbackTransactionType<T> = (tx: Transaction) => Promise<T>;

export const handleTransaction = async <T>(
  callback: callbackTransactionType<T>,
) => {
  return await db.transaction(async (tx) => {
    return await callback(tx);
  });
};
