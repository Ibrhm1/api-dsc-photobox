import { Resolver } from 'dns/promises';
import disposableDomains from 'disposable-email-domains';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const resolver = new Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);

export const isRealEmail = async (email: string): Promise<boolean> => {
  if (!EMAIL_REGEX.test(email)) {
    return false;
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  if (disposableDomains.includes(domain)) {
    return false;
  }

  try {
    const mxRecords = await resolver.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch {
    return false;
  }
};
