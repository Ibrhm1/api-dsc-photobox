export const requestBodyCustomer = {
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['name', 'email', 'instagramUsername'],
        properties: {
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            example: 'johndoe@example.com',
          },
          phoneNumber: {
            type: 'string',
            example: '081234567890',
          },
          instagramUsername: {
            type: 'string',
            example: 'johndoe_instagram',
          },
        },
      },
    },
  },
};
