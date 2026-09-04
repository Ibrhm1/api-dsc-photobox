import { responseError } from '../response/error.response.ts';
import { responseSuccess } from '../response/success.response.ts';

export const cleanUpPath = {
  delete: {
    tags: ['System Clean Up'],
    summary: 'Clean up old photo sessions, customers, and files',
    description:
      'Trigger a clean-up task to delete data and storage folders for session files that are outdated.',
    responses: {
      200: responseSuccess({
        description: 'Membersihkan semua data',
        exampleMessage: 'Berhasil membersihkan',
        data: {
          type: 'object',
          example: {
            deletedCustomers: {},
            deletedPhotos: {},
            deletedSessions: {},
          },
        },
      }),
      500: responseError({
        description: 'Internal server error during clean-up',
        exampleMessage: 'Internal server error during clean-up',
        statusCode: 500,
      }),
    },
  },
};
