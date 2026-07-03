import z from 'zod';

const createPhotoSessionValidation = z.object({
  id: z.string().length(9).startsWith('DSCP'),
});

export const photoSessionsValidation = {
  createPhotoSessionValidation,
};
