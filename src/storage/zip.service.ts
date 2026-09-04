import { ZipArchive } from 'archiver';
import { AppError } from '../errors/appError.js';
import { supabase } from '../infrastructure/database/supabase.js';
import storageService, { storageConfig } from './storage.service.js';
import { logger } from '../infrastructure/logging/logger.js';

const serviceName = '[ZIP Service]';

export const generateZip = async (
  resolve: (value: Buffer | PromiseLike<Buffer>) => void,
  reject: (reason?: any) => void,
) => {
  const chunks: Buffer[] = [];

  const archive = new ZipArchive({
    zlib: {
      level: 9,
    },
  });
  archive.on('data', (chunk) => chunks.push(chunk));
  archive.on('end', () => resolve(Buffer.concat(chunks)));
  archive.on('error', (err) => reject(err));

  return archive;
};

export const generateZipPhotos = async (
  downloadedFiles: { name: string; buffer: Buffer }[],
) => {
  return await new Promise<Buffer>(async (resolve, reject) => {
    const archive = await generateZip(resolve, reject);

    try {
      for (const file of downloadedFiles) {
        archive.append(file.buffer, { name: file.name });
      }

      archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
};

export const createZipSession = async (sessionId: string) => {
  logger.info(
    {
      service: serviceName,
      sessionId,
    },
    'Mulai proses pembuatan zip file',
  );

  const { data: files, error: errorListBucket } = await supabase.storage
    .from(storageConfig.bucketName)
    .list(`${sessionId}/original`);

  if (errorListBucket) {
    logger.warn(
      {
        service: serviceName,
        sessionId,
        error: errorListBucket,
      },
      'Gagal mengambil file dari Supabase',
    );
    throw new AppError(500, `Gagal mengambil file dari Supabase`);
  }

  // 1. Download all files in parallel (Optimasi Point 6 - Parallel I/O)
  const downloadedFiles = await storageService.downloadFilesFromSupabase(
    sessionId,
    files,
  );

  const zipBuffer = await generateZipPhotos(downloadedFiles);

  const zipPath = `${sessionId}/archive/${sessionId.toLowerCase()}.zip`;
  const { error: uploadError } = await supabase.storage
    .from(storageConfig.bucketName)
    .upload(zipPath, zipBuffer, {
      contentType: 'application/zip',
    });

  if (uploadError) {
    logger.warn(
      {
        service: serviceName,
        sessionId,
        error: uploadError,
      },
      'Gagal mengupload file zip',
    );
    throw new AppError(500, `Gagal mengupload file zip`);
  }

  const { data } = supabase.storage
    .from(storageConfig.bucketName)
    .getPublicUrl(zipPath);

  logger.info(
    {
      service: serviceName,
      sessionId,
      url: data.publicUrl,
    },
    'Berhasil mengupload file zip',
  );

  return data.publicUrl;
};
