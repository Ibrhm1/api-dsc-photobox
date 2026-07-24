import { AppError } from '../errors/appError';
import { logger } from '../infrastructure/logging/logger';
import { photosRepository } from '../repositories/photos.repository';
import { photoSessionsRepository } from '../repositories/photoSessions.repository';
import storageService from '../storage/storage.service';
import { createZipSession } from '../storage/zip.service';
import type { CreatePhotosType } from '../types/photos.type';
import { handleTransaction } from '../utils/handleTransaction';
import { cacheKey, cacheService } from '../infrastructure/cache/cache.service';

const service = '[Photos Service]';

const uploadPhotos = async (data: CreatePhotosType) => {
  logger.info(
    {
      service,
      sessionId: data.sessionId,
      files: data.files.length,
    },
    'Proses upload photos',
  );

  const existingPhotoSession =
    await photoSessionsRepository.findPhotoSessionById(data.sessionId);

  if (!existingPhotoSession) {
    logger.warn(
      {
        service,
        sessionId: data.sessionId,
      },
      'Photo Session tidak ditemukan',
    );
    throw new AppError(404, 'Photo Session tidak ditemukan');
  }

  try {
    const processUploadPhotos = await storageService.uploadFiles({
      files: data.files,
      sessionId: data.sessionId,
    });

    const zipUrl = await createZipSession(data.sessionId);

    if (!processUploadPhotos && !zipUrl) {
      logger.warn(
        {
          service,
          sessionId: data.sessionId,
          files: data.files.length,
          storage: processUploadPhotos,
        },
        'Gagal upload photos',
      );
      throw new AppError(400, 'Gagal upload photos');
    }

    logger.info(
      {
        service,
        sessionId: data.sessionId,
        files: processUploadPhotos.length,
      },
      'Proses upload photos selesai',
    );

    const photos = await handleTransaction(async (tx) => {
      const photos = await Promise.all(
        processUploadPhotos.map((item) =>
          photosRepository.createPhotos(
            {
              sessionId: data.sessionId,
              fileName: item.fileName,
              fileUrl: item.publicUrl,
              folderName: item.folderPath,
            },
            tx,
          ),
        ),
      );
      const photosession =
        await photoSessionsRepository.updateZipUrlPhotoSession(
          {
            id: data.sessionId,
            zipUrl: zipUrl,
          },
          tx,
        );
      return { dataPhotos: photos, dataPhotosession: photosession };
    });

    await cacheService.del({ key: cacheKey.session() });
    await cacheService.del({ key: 'public:gallery' });

    return {
      zipUrl: photos.dataPhotosession?.zipUrl,
      photos: photos.dataPhotos,
    };
  } catch (error) {
    logger.error(
      {
        service,
        sessionId: data.sessionId,
        error,
      },
      'Gagal upload photos',
    );
    await storageService.deleteSessionFiles(data.sessionId);
    throw new AppError(500, 'Gagal upload photos');
  }
};

const getAllPhotosBySessionId = async (sessionId: string) => {
  logger.info(
    {
      service,
      sessionId,
    },
    'Proses mengambil data photos',
  );

  const existingPhotoSession =
    await photoSessionsRepository.findPhotoSessionById(sessionId);

  if (!existingPhotoSession) {
    logger.warn(
      {
        service,
        sessionId,
      },
      'Photo Session tidak ditemukan',
    );
    throw new AppError(404, 'Photo Session tidak ditemukan');
  }

  const cacheKeyPhotos = cacheKey.photos(sessionId);
  const photosBySessionId = await cacheService.get({ key: cacheKeyPhotos });

  if (photosBySessionId) {
    return { photos: photosBySessionId, fromCache: true };
  }

  const dbResults = await photosRepository.getPhotosBySessionId(
    existingPhotoSession.id,
  );

  if (dbResults.length === 0) {
    logger.warn(
      {
        service,
        sessionId,
      },
      'Photos kosong',
    );
    throw new AppError(404, 'Photos kosong');
  }

  const customer = dbResults[0]?.customers;
  const photosList = dbResults.map((item) => item.photos);
  const dataResult = {
    customer,
    photos: photosList,
  };

  await cacheService.set({
    key: cacheKeyPhotos,
    data: dataResult,
  });

  return { photos: dataResult, fromCache: false };
};

export const photosService = {
  uploadPhotos,
  getAllPhotosBySessionId,
};
