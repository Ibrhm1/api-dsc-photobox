import { AppError } from '../errors/appError';
import { supabase } from '../infrastructure/database/supabase';
import { logger } from '../infrastructure/logging/logger';
import type { UploadFileParamsType } from '../types/storage.type';

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
      const fileBody = new Uint8Array(file.buffer).buffer;

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

export default {
  storageConfig,
  uploadFiles,
  deleteFolderFromSupabase,
  deleteSessionFiles,
};
