export const photoSessionSchema = {
  PhotoSession: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: 'PXS-H-DE_CUPYS',
      },
      zipUrl: {
        type: 'string',
        format: 'url',
        nullable: true,
        example: 'https://example.com/file.zip',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-25T13:26:49.000Z',
      },
    },
  },
  PhotoSessionWithDetails: {
    allOf: [
      { $ref: '#/components/schemas/PhotoSession' },
      {
        type: 'object',
        properties: {
          customer: {
            type: 'object',
            $ref: '#/components/schemas/CustomerWithSession',
          },
          photos: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Photo',
            },
          },
        },
      },
    ],
  },
};
