export const photosSchema = {
  Photo: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      },
      sessionId: {
        type: 'string',
        example: 'PXS-DRGDYCTKYW',
      },
      folderName: {
        type: 'string',
        example: 'PXS-DRGDYCTKYW',
      },
      fileName: {
        type: 'string',
        example: 'pxs-drgdyctkyw-dsc-photobox-(1).jpg',
      },
      fileUrl: {
        type: 'string',
        format: 'uri',
        example:
          'https://example.com/storage/v1/object/public/dsc-photobox-storage/PXS-DRGDYCTKYW/original/pxs-drgdyctkyw-dsc-photobox-(1).jpg',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-25T13:26:49.000Z',
      },
    },
  },
};
