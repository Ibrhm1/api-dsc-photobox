import { Resolver } from 'dns/promises';
import disposableDomains from 'disposable-email-domains';
import { logger } from '../infrastructure/logging/logger.ts';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const resolver = new Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);

export const isRealEmail = async (email: string): Promise<boolean> => {
  logger.info({ email }, 'Validasi email');

  if (!EMAIL_REGEX.test(email)) {
    logger.warn({ email }, 'Format email tidak valid');
    return false;
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  if (disposableDomains.includes(domain)) {
    logger.warn({ email, domain }, 'Email menggunakan domain disposable');
    return false;
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DNS Timeout')), 3500),
    );
    const mxPromise = resolver.resolveMx(domain);
    const mxRecords = (await Promise.race([
      mxPromise,
      timeoutPromise,
    ])) as Array<{ exchange: string; priority: number }>;

    logger.info({ domain }, 'Hasil validasi MX record', { mxRecords });

    return Array.isArray(mxRecords) && mxRecords.length > 0;
  } catch (error) {
    logger.error(
      { domain, error },
      `Gagal memeriksa MX record untuk domain ${domain}: ${error}`,
    );
    return false;
  }
};
