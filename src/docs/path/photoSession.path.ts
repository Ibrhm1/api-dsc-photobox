import { responseError } from '../response/error.response.js';
import { responseSuccess } from '../response/success.response.js';

const tags = ['Photo Sessions'];

export const photoSessionPath = {
  '/photo-sessions': {
    post: {
      tags: ['Photo Sessions'],
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
  },
};
