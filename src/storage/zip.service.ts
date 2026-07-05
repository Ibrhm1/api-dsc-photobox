import { ZipArchive } from 'archiver';
import { AppError } from '../errors/appError';
import { supabase } from '../infrastructure/database/supabase.ts';
import { storageConfig } from './storage.service';

export const createZipSession = async (sessionId: string) => {
  const { data: files, error } = await supabase.storage
    .from(storageConfig.bucketName)
    .list(`${sessionId}/original`);

  if (error) {
    throw new AppError(
      500,
      `Gagal mengambil file dari Supabase: ${error.message}`,
    );
  }

  const archive = new ZipArchive({
    zlib: {
      level: 9,
    },
  });

  const chunks: Buffer[] = [];

  archive.on('data', (chunk) => {
    chunks.push(chunk);
  });

  for (const file of files) {
    const path = `${sessionId}/original/${file.name}`;

    const { data, error } = await supabase.storage
      .from(storageConfig.bucketName)
      .download(path);

    if (error) {
      throw new AppError(
        500,
        `Gagal mengambil file dari Supabase: ${error.message}`,
      );
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    archive.append(buffer, {
      name: file.name,
    });
  }

  await archive.finalize();

  const zipBuffer = Buffer.concat(chunks);

  const zipPath = `${sessionId}/archive/${sessionId.toLowerCase()}.zip`;

  const { error: uploadError } = await supabase.storage
    .from(storageConfig.bucketName)
    .upload(zipPath, zipBuffer, {
      contentType: 'application/zip',
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(storageConfig.bucketName)
    .getPublicUrl(zipPath);

  return data.publicUrl;
};
