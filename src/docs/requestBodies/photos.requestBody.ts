export const requestBodyPhotos = {
  required: true,
  content: {
    'multipart/form-data': {
      schema: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            description: 'The photo files to upload (max 10)',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    },
  },
};
