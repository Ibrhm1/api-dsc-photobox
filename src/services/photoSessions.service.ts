import { nanoid } from 'nanoid';
import { photoSessionsRepository } from '../repositories/photoSessions.repository';
import { logger } from '../infrastructure/logging/logger';
import { AppError } from '../errors/appError';

const serviceName = '[Photo Session Service]';

const createNewPhotoSession = async () => {
  const uuid = nanoid(6);
  const idSession = `DSCP_${uuid}`;

  const photoSession = await photoSessionsRepository.createPhotoSession({
    id: idSession,
  });

  if (!photoSession) {
    logger.error('Gagal membuat sesi foto');
    throw new AppError(400, 'Gagal membuat sesi foto');
  }

  logger.info(
    {
      service: serviceName,
      id: photoSession.id,
      zipUrl: photoSession.zipUrl,
    },
    'Berhasil menambahkan photo session',
  );

  return photoSession;
};

export const photoSessionsService = {
  createNewPhotoSession,
};
