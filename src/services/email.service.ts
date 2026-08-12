import nodemailer from 'nodemailer';
import path from 'path';
import { env } from '../utils/env';
import ejs from 'ejs';
import { logger } from '../infrastructure/logging/logger';

export const transporter = nodemailer.createTransport({
  service: env.MAIL_SERVICE,
  auth: {
    user: env.MAIL_USERNAME,
    pass: env.MAIL_PASSWORD,
  },
});

export const sendMailToCustomer = async (dataPayload: {
  name: string;
  email: string;
  zipUrl: string;
}) => {
  const templateMail = path.join(
    process.cwd(),
    'src/utils/views',
    'template-email.ejs',
  );

  const htmlEmail = await ejs.renderFile(templateMail, {
    name: dataPayload.name,
    zipUrl: dataPayload.zipUrl,
  });

  return transporter.sendMail(
    {
      from: env.MAIL_USERNAME,
      to: dataPayload.email,
      subject: 'Hasil Foto DSCBooth Anda 📸',
      html: htmlEmail,
    },
    function (error, info) {
      if (error) {
        logger.error(
          { error: error.message },
          'Terjadi kesalahan pada saat pengiriman email',
        );
      } else {
        logger.info({ response: info.response }, 'Email berhasil terkirim');
      }
    },
  );
};
