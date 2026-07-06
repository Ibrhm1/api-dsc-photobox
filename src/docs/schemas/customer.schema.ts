export const customerSchema = {
  Customer: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: 'd3b07384-d113-4ec5-a5d9-438c823055ab',
      },
      sessionId: {
        type: 'string',
        example: 'PXS-H-DE_CUPYS',
      },
      name: {
        type: 'string',
        example: 'John Doe',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'johndoe@example.com',
      },
      phoneNumber: {
        type: 'string',
        nullable: true,
        example: '081234567890',
      },
      instagramUsername: {
        type: 'string',
        example: 'johndoe_instagram',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-06-25T13:26:49.000Z',
      },
    },
  },
  CustomerWithSession: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: 'a0f93e77-0add-4c95-beb0-98c534f5dae1',
      },
      name: {
        type: 'string',
        example: 'John Doe',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'johndoe@example.com',
      },
      phoneNumber: {
        type: 'string',
        nullable: true,
        example: '081234567890',
      },
      instagramUsername: {
        type: 'string',
        example: 'johndoe_instagram',
      },
    },
  },
};
