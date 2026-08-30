import { AppError } from '../errors/appError';
import { supabase } from '../infrastructure/database/supabase';
import { logger } from '../infrastructure/logging/logger';
import type { UploadFileParamsType } from '../types/storage';
import { generateZipPhotos } from './zip.service';

export const storageConfig = {
  bucketName: 'dsc-photobox-storage',
};

const serviceName = '[storageService]';

const formateNameFile = (
  originalname: string,
  index: number,
  prefix: string,
) => {
  const fileExt = originalname.split('.').pop();
  return `${prefix.toLowerCase()}-dsc-photobox-(${index + 1}).${fileExt}`;
};

const uploadFiles = ({ files, sessionId }: UploadFileParamsType) => {
  logger.info(
    {
      service: serviceName,
      totalFiles: files.length,
      sessionId,
    },
    'Memulai upload file',
  );
  return Promise.all(
    files.map(async (file, fileIdx) => {
      const fileName = formateNameFile(file.originalname, fileIdx, sessionId);
      const filePath = `${sessionId}/original/${fileName}`;
      const fileBody = file.buffer;

      const { error } = await supabase.storage
        .from(storageConfig.bucketName)
        .upload(filePath, fileBody, {
          cacheControl: '3600',
          contentType: file.mimetype,
        });

      if (error) {
        logger.error(
          {
            service: serviceName,
            ...error,
          },
          'Gagal mengupload file',
        );
        throw new AppError(500, `Gagal mengupload file`);
      }

      const { data } = supabase.storage
        .from(storageConfig.bucketName)
        .getPublicUrl(filePath);

      logger.info(
        {
          service: serviceName,
          fileName,
          sessionId,
        },
        'Berhasil mengupload file',
      );

      return {
        folderPath: sessionId,
        fileName,
        path: filePath,
        publicUrl: data.publicUrl,
      };
    }),
  );
};

const extractPathFromUrl = (publicUrl: string): string => {
  const urlParts = publicUrl.split(`/public/${storageConfig.bucketName}/`);

  if (urlParts.length !== 2) {
    return '';
  }

  return urlParts[1] as string;
};

const deleteFolderFromSupabase = async (folderPath: string) => {
  const filePath = extractPathFromUrl(folderPath);

  if (!filePath) {
    throw new AppError(
      400,
      `Folder path ${folderPath} tidak valid, pastikan folder sudah benar`,
    );
  }

  const { error, data } = await supabase.storage
    .from(storageConfig.bucketName)
    .remove([filePath]);

  if (error) {
    logger.error(
      `Gagal delete folder dari bucket ${storageConfig.bucketName}: ${error.message}`,
    );
    throw new AppError(
      500,
      `Gagal delete folder dari bucket ${storageConfig.bucketName}: ${error.message}`,
    );
  }

  return data;
};

const deleteSessionFiles = async (sessionId: string) => {
  try {
    const { data: originalFiles } = await supabase.storage
      .from(storageConfig.bucketName)
      .list(`${sessionId}/original`);

    const { data: archiveFiles } = await supabase.storage
      .from(storageConfig.bucketName)
      .list(`${sessionId}/archive`);

    const pathsToDelete: string[] = [];

    if (originalFiles && originalFiles.length > 0) {
      originalFiles.forEach((file) => {
        pathsToDelete.push(`${sessionId}/original/${file.name}`);
      });
    }

    if (archiveFiles && archiveFiles.length > 0) {
      archiveFiles.forEach((file) => {
        pathsToDelete.push(`${sessionId}/archive/${file.name}`);
      });
    }

    if (pathsToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from(storageConfig.bucketName)
        .remove(pathsToDelete);

      if (deleteError) {
        logger.error(
          `${serviceName}: Gagal menghapus file saat rollback: ${deleteError.message}`,
        );
      } else {
        logger.info(
          `${serviceName}: Rollback berhasil, menghapus files: ${pathsToDelete.join(', ')}`,
        );
      }
    }
  } catch (error) {
    const err = error as Error;
    logger.error(`${serviceName}: Gagal melakukan rollback: ${err.message}`);
    throw new AppError(500, 'Gagal melakukan rollback');
  }
};

const downloadFilesFromSupabase = async (
  sessionId: string,
  files: { name: string }[],
) => {
  return await Promise.all(
    files.map(async (file) => {
      const path = `${sessionId}/original/${file.name}`;
      const { data, error: errorDownload } = await supabase.storage
        .from(storageConfig.bucketName)
        .download(path);

      if (errorDownload) {
        logger.warn(
          {
            service: serviceName,
            sessionId,
            fileName: file.name,
            error: errorDownload,
          },
          'Gagal mengambil file dari Supabase',
        );
        throw new AppError(500, `Gagal mengambil file dari Supabase`);
      }

      const buffer = Buffer.from(await data.arrayBuffer());

      return { name: file.name, buffer };
    }),
  );
};

const exportBucketFolders = async (sessionId: string) => {
  const { data: originalFiles } = await supabase.storage
    .from(storageConfig.bucketName)
    .list(`${sessionId}/original`);

  return { originalFiles };
};

const downloadAllFilesFromBucket = async () => {
  const filePaths: string[] = [];

  const scanFolder = async (prefix: string = '') => {
    const { data, error } = await supabase.storage
      .from(storageConfig.bucketName)
      .list(prefix, { limit: 1000 });

    if (error || !data) return;

    for (const item of data) {
      if (item.name === '.emptyFolderPlaceholder') continue;

      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;

      if (!item.id || item.metadata === null) {
        await scanFolder(itemPath);
      } else {
        filePaths.push(itemPath);
      }
    }
  };

  await scanFolder('');

  if (filePaths.length === 0) {
    throw new AppError(404, 'Tidak ada file di dalam bucket untuk diekspor');
  }

  const downloadedFiles = await Promise.all(
    filePaths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from(storageConfig.bucketName)
        .download(path);

      if (error || !data) {
        logger.warn({ service: serviceName, path, error }, 'Gagal mengunduh file dari bucket');
        return null;
      }

      const buffer = Buffer.from(await data.arrayBuffer());
      return { name: path, buffer };
    }),
  );

  const validFiles = downloadedFiles.filter(
    (f): f is { name: string; buffer: Buffer } => f !== null,
  );

  if (validFiles.length === 0) {
    throw new AppError(404, 'Gagal mengunduh file dari bucket');
  }

  return { validFiles, filePaths };
};

const deleteBucketFiles = async (filePaths: string[]) => {
  if (!filePaths || filePaths.length === 0) return;

  const { error } = await supabase.storage
    .from(storageConfig.bucketName)
    .remove(filePaths);

  if (error) {
    logger.error(
      { service: serviceName, error },
      'Gagal menghapus file dari bucket',
    );
    throw new AppError(500, `Gagal menghapus file dari bucket: ${error.message}`);
  }

  logger.info(
    { service: serviceName, count: filePaths.length },
    'Berhasil menghapus file dari bucket',
  );
};

export default {
  storageConfig,
  uploadFiles,
  deleteFolderFromSupabase,
  deleteSessionFiles,
  downloadFilesFromSupabase,
  exportBucketFolders,
  downloadAllFilesFromBucket,
  deleteBucketFiles,
};