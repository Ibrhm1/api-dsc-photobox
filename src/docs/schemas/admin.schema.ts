export const adminSchema = {
  Admin: {
    type: 'object',
    properties: {
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
        nullable: true,
        example: '2026-07-06T16:08:16.613Z',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-07-06T08:19:40.441Z',
      },
    },
  },
};
