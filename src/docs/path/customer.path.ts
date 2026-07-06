import { requestBodyCustomer } from '../requestBodies/customer.requestBody.ts';
import { responseError } from '../response/error.response.ts';
import { responseSuccess } from '../response/success.response.ts';

const tags = ['Customers'];

export const customerPath = {
  '/customers': {
    get: {
      tags,
      summary: 'Mengambil semua data customers',
      responses: {
        200: responseSuccess({
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Customer',
            },
          },
          description: 'Mengambil semua data dari customers',
          exampleMessage: 'Berhasil mengambil semua data customers',
        }),
        404: responseError({
          description: 'Data customers kosong',
          exampleMessage: 'Data customer tidak ditemukan',
          statusCode: 404,
        }),
      },
    },
  },
  '/customers/{sessionId}': {
    post: {
      tags,
      summary: 'Create a new customer and link to a photo session',
      parameters: [
        {
          name: 'sessionId',
          in: 'path',
          required: true,
          description: 'ID of the photo session to link the customer to',
          schema: {
            type: 'string',
            example: 'PXS-H-DE_CUPYS',
          },
        },
      ],
      requestBody: requestBodyCustomer,
      responses: {
        201: responseSuccess({
          description:
            'Berhasil untuk menambahkan data customers berdasarkan session id',
          exampleMessage: 'Data berhasil ditambahkan',
          data: {
            type: 'object',
            $ref: '#/components/schemas/Customer',
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
