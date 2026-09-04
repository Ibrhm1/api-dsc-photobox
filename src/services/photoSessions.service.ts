import { nanoid } from 'nanoid';
import { photoSessionsRepository } from '../repositories/photoSessions.repository.ts';
import { logger } from '../infrastructure/logging/logger.ts';
import { AppError } from '../errors/appError.ts';
import { cacheService } from '../infrastructure/cache/cache.service.ts';

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

const getPublicGallerySessions = async () => {
  logger.info(
    { service: serviceName },
    'Proses mengambil semua data public gallery',
  );

  const cacheKeyGallery = 'public:gallery';
  const cachedGallery = await cacheService.get<any[]>({ key: cacheKeyGallery });
  if (cachedGallery) {
    logger.info(
      { service: serviceName },
      'Berhasil mengambil semua data public gallery dari cache',
    );
    return { sessions: cachedGallery, fromCache: true };
  }

  const allSessions = await photoSessionsRepository.getGallerySessions();
  if (!allSessions) {
    logger.warn({ service: serviceName }, 'Gagal mendapatkan data gallery');
    throw new AppError(400, 'Gagal mendapatkan data gallery');
  }

  const groupedData = allSessions.reduce<Record<string, any>>((acc, row) => {
    const sessionId = row.photoSession.id;

    if (!acc[sessionId]) {
      acc[sessionId] = {
        id: sessionId,
        createdAt: row.photoSession.createdAt,
        name: row.customer?.name || 'Anonim',
        photos: [],
      };
    }

    if (row.photo?.fileUrl) {
      acc[sessionId].photos.push(row.photo.fileUrl);
    }

    return acc;
  }, {});

  // Convert to array and filter out sessions that don't have photos
  const groupedSessions = Object.values(groupedData).filter(
    (s: any) => s.photos.length > 0,
  );

  await cacheService.set({
    key: cacheKeyGallery,
    data: groupedSessions,
    ttl: 60, // Cache for 60 seconds
  });

  logger.info(
    { service: serviceName, count: groupedSessions.length },
    'Berhasil mendapatkan data public gallery',
  );

  return { sessions: groupedSessions, fromCache: false };
};

export const photoSessionsService = {
  createNewPhotoSession,
  getPublicGallerySessions,
};
