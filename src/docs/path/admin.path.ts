import {
  requestBodyLoginAdmin,
  requestBodyRegisterAdmin,
} from '../requestBodies/admin.requestBody.ts';
import { responseError } from '../response/error.response.ts';
import { responseSuccess } from '../response/success.response.ts';

const tags = ['Admins'];

export const adminPath = {
  '/admins/register': {
    post: {
      tags,
      summary: 'Register a new admin',
      requestBody: requestBodyRegisterAdmin,
      responses: {
        201: responseSuccess({
          description: 'Registrasi admin berhasil',
          exampleMessage: 'Register admin berhasil',
          data: {
            type: 'object',
            properties: {
              admin: {
                type: 'object',
                $ref: '#/components/schemas/Admin',
              },
            },
          },
        }),
        400: responseError({
          description: 'Validasi error atau email sudah digunakan',
          exampleMessage: 'Email sudah terdaftar',
          statusCode: 400,
        }),
      },
    },
  },
  '/admins/login': {
    post: {
      tags,
      summary: 'Login as an admin',
      requestBody: requestBodyLoginAdmin,
      responses: {
        200: responseSuccess({
          description: 'Login admin berhasil',
          exampleMessage: 'Admin berhasil login',
          data: {
            type: 'object',
            properties: {
              accessToken: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              id: {
                type: 'string',
                format: 'uuid',
                example: 'c53ccf6e-188e-4fd2-a540-285c5ffa3f96',
              },
              email: {
                type: 'string',
                format: 'email',
                example: 'admin@example.com',
              },
              lastLogin: {
                type: 'string',
                format: 'date-time',
                example: '2026-07-06T16:08:16.613Z',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2026-07-06T08:19:40.441Z',
              },
            },
          },
        }),
        400: responseError({
          description: 'Email atau password salah',
          exampleMessage: 'Admin gagal login atau tidak terdaftar',
          statusCode: 400,
        }),
      },
    },
  },
  '/admins/me': {
    get: {
      tags,
      summary: 'Get current logged in admin profile',
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: responseSuccess({
          description: 'Mendapatkan profil admin berhasil',
          exampleMessage: 'Admin berhasil login',
          data: {
            $ref: '#/components/schemas/Admin',
          },
        }),
        401: responseError({
          description: 'Unauthorized / Token tidak valid',
          exampleMessage: 'Sesi telah berakhir, silakan login kembali',
          statusCode: 401,
        }),
      },
    },
  },
  '/admins/logout': {
    delete: {
      tags,
      summary: 'Logout admin and invalidate token',
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: responseSuccess({
          description: 'Logout admin berhasil',
          exampleMessage: 'Admin berhasil logout',
          data: {
            type: 'object',
            nullable: true,
          },
        }),
        401: responseError({
          description: 'Unauthorized / Token tidak valid',
          exampleMessage: 'Sesi telah berakhir, silakan login kembali',
          statusCode: 401,
        }),
      },
    },
  },
  '/admins/customers': {
    get: {
      tags,
      summary: 'Get all customers (Admin only)',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: 'email',
          in: 'query',
          required: false,
          description: 'Email pencarian (opsional)',
          schema: {
            type: 'string',
            example: 'test',
          },
        },
      ],
      responses: {
        200: responseSuccess({
          description: 'Mendapatkan semua data customer dan zipUrl sesinya',
          exampleMessage: 'Admin berhasil mendapatkan semua customers',
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  example: 'ed47ed28-c287-4764-8cdc-5fa68a6fcdb7',
                },
                sessionId: {
                  type: 'string',
                  example: 'DSCP_mqB4uE',
                },
                zipUrl: {
                  type: 'string',
                  nullable: true,
                  example:
                    'https://qwbybpyffkrucmzvlwls.supabase.co/storage/v1/object/public/dsc-photobox-storage/DSCP_mqB4uE/archive/dscp_mqb4ue.zip',
                },
                name: {
                  type: 'string',
                  example: 'Iib Ibrahim',
                },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'test.user01@gmail.com',
                },
                phoneNumber: {
                  type: 'string',
                  example: '081234567890',
                },
                instagramUsername: {
                  type: 'string',
                  example: 'iib_ibrahim',
                },
                major: {
                  type: 'string',
                  example: 'informatika',
                },
                npm: {
                  type: 'string',
                  example: '123456789101112',
                },
              },
            },
          },
        }),
        401: responseError({
          description: 'Unauthorized',
          exampleMessage: 'Sesi telah berakhir, silakan login kembali',
          statusCode: 401,
        }),
      },
    },
  },
  '/admins/sessions': {
    get: {
      tags,
      summary:
        'Get all sessions grouped with nested photos and customer details',
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: responseSuccess({
          description: 'Mendapatkan semua session terkelompok',
          exampleMessage: 'Admin berhasil mendapatkan semua session',
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                photoSession: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: 'DSCP_mqB4uE',
                    },
                    zipUrl: {
                      type: 'string',
                      nullable: true,
                      example:
                        'https://qwbybpyffkrucmzvlwls.supabase.co/storage/v1/object/public/dsc-photobox-storage/DSCP_mqB4uE/archive/dscp_mqb4ue.zip',
                    },
                  },
                },
                customer: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                      example: 'ed47ed28-c287-4764-8cdc-5fa68a6fcdb7',
                    },
                    name: {
                      type: 'string',
                      example: 'Iib Ibrahim',
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'test.user01@gmail.com',
                    },
                    npm: {
                      type: 'string',
                      example: '123456789101112',
                    },
                    major: {
                      type: 'string',
                      example: 'informatika',
                    },
                    phoneNumber: {
                      type: 'string',
                      example: '081234567890',
                    },
                    instagramUsername: {
                      type: 'string',
                      example: 'iib_ibrahim',
                    },
                  },
                },
                photos: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                        example: '5c7debd5-729f-4eca-bf1e-de735a0949c9',
                      },
                      fileName: {
                        type: 'string',
                        example: 'dscp_mqb4ue-dsc-photobox-(2).jpeg',
                      },
                      fileUrl: {
                        type: 'string',
                        example:
                          'https://qwbybpyffkrucmzvlwls.supabase.co/storage/v1/object/public/dsc-photobox-storage/DSCP_mqB4uE/original/dscp_mqb4ue-dsc-photobox-(2).jpeg',
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        401: responseError({
          description: 'Unauthorized',
          exampleMessage: 'Sesi telah berakhir, silakan login kembali',
          statusCode: 401,
        }),
      },
    },
  },
};
