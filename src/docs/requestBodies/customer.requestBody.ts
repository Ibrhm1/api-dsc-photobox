export const requestBodyCustomer = {
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['name', 'email', 'npm', 'major', 'instagramUsername'],
        properties: {
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            example: 'johndoe@example.com',
          },
          npm: {
            type: 'string',
            example: '1202203040',
            description: 'Nomor Pokok Mahasiswa (Maksimal 15 karakter)',
          },
          major: {
            type: 'string',
            example: 'Teknik Informatika',
            description: 'Jurusan / Program Studi',
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
