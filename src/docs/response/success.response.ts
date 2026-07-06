type ResponseSuccessParamsType = {
  description: string;
  exampleMessage: string;
  data: unknown;
};

export const responseSuccess = ({
  description,
  exampleMessage,
  data,
}: ResponseSuccessParamsType) => {
  return {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: exampleMessage,
            },
            data,
          },
        },
      },
    },
  };
};
