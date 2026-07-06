import { ZipArchive } from 'archiver';
import { AppError } from '../errors/appError';
import { supabase } from '../infrastructure/database/supabase.ts';
import { storageConfig } from './storage.service';
import { logger } from '../infrastructure/logging/logger.ts';

const serviceName = '[ZIP Service]';

export const createZipSession = async (sessionId: string) => {
  logger.info(
    {
      service: serviceName,
      sessionId,
    },
    'Mulai proses pembuatan zip file',
  );

  const { data: files, error } = await supabase.storage
    .from(storageConfig.bucketName)
    .list(`${sessionId}/original`);

  if (error) {
    logger.warn(
      {
        service: serviceName,
        sessionId,
        error,
      },
      'Gagal mengambil file dari Supabase',
    );
    throw new AppError(500, `Gagal mengambil file dari Supabase`);
  }

  // 1. Download all files in parallel (Optimasi Point 6 - Parallel I/O)
  const downloadedFiles = await Promise.all(
    files.map(async (file) => {
      const path = `${sessionId}/original/${file.name}`;
      const { data, error } = await supabase.storage
        .from(storageConfig.bucketName)
        .download(path);

      if (error) {
        logger.warn(
          {
            service: serviceName,
            sessionId,
            fileName: file.name,
            error,
          },
          'Gagal mengambil file dari Supabase',
        );
        throw new AppError(500, `Gagal mengambil file dari Supabase`);
      }

      const buffer = Buffer.from(await data.arrayBuffer());
      return { name: file.name, buffer };
    }),
  );

  // 2. Wrap archive generation in Promise to ensure stream completion (Point 1)
  const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
    const archive = new ZipArchive({
      zlib: {
        level: 9,
      },
    });
    const chunks: Buffer[] = [];
    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', (err) => reject(err));

    try {
      for (const file of downloadedFiles) {
        archive.append(file.buffer, { name: file.name });
      }
      archive.finalize();
    } catch (err) {
      reject(err);
    }
  });

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
