import { requestBodyPhotos } from '../requestBodies/photos.requestBody.ts';
import { responseError } from '../response/error.response.ts';
import { responseSuccess } from '../response/success.response.ts';

const tags = ['Photos'];

export const photosPath = {
  '/photos/{sessionId}': {
    post: {
      tags,
      summary: 'Mengupload foto berdasarkan session id',
      description: 'Upload foto berdasarkan session id',
      parameters: [
        {
          name: 'sessionId',
          in: 'path',
          required: true,
          description: 'ID of the photo session to upload files to',
          schema: {
            type: 'string',
            example: 'PXS-H-DE_CUPYS',
          },
        },
      ],
      requestBody: requestBodyPhotos,
      responses: {
        201: responseSuccess({
          description: 'Berhasil mengupload foto berdasarkan session id',
          exampleMessage: 'Foto berhasil di-upload',
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Photo',
            },
          },
        }),
        400: responseError({
          description: 'Bad request / File validation error',
          exampleMessage: 'Validasi file gagal',
          statusCode: 400,
        }),
      },
    },
    get: {
      tags,
      summary: 'Mengambil semua foto berdasarkan session id',
      parameters: [
        {
          name: 'sessionId',
          in: 'path',
          required: true,
          description: 'ID of the photo session to retrieve photos for',
          schema: {
            type: 'string',
            example: 'PXS-H-DE_CUPYS',
          },
        },
      ],
      responses: {
        200: responseSuccess({
          description: 'Berhasil mengambil semua foto berdasarkan session id',
          exampleMessage: 'Foto berhasil diambil',
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Photo',
            },
          },
        }),
        404: responseError({
          description: 'Photos not found',
          exampleMessage:
            'Tidak ada foto yang ditemukan dengan session ID yang diberikan',
        }),
      },
    },
  },
};
