import { responseError } from '../response/error.response.ts';
import { responseSuccess } from '../response/success.response.ts';

const tags = ['Photo Session'];

export const photoSessionPath = {
  '/photo-session': {
    post: {
      tags: ['Photo Session'],
      summary: 'Create a new photo session',
      responses: {
        201: responseSuccess({
          description: 'Successfully created a new photo session',
          exampleMessage: 'Data Session Photo berhasil dibuat',
          data: {
            $ref: '#/components/schemas/PhotoSession',
          },
        }),
        400: responseError({
          description: 'Validasi error',
          exampleMessage: 'Validasi gagal, silakan periksa kembali input Anda',
          statusCode: 400,
          exampleErrors: {
            field: 'name',
            message: 'Nama tidak boleh kosong',
          },
        }),
      },
    },
    get: {
      tags,
      summary:
        'Mendapatkan semua data session photo dengan relasi customer dan photo ',
      responses: {
        200: responseSuccess({
          description: 'Data Session Photo berhasil diambil',
          exampleMessage: 'Data Session Photo berhasil diambil',
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PhotoSessionWithDetails',
            },
          },
        }),
        404: responseError({
          description: 'Data Session Photo kosong',
          exampleMessage: 'Data Session Photo tidak ditemukan',
        }),
      },
    },
  },
};
