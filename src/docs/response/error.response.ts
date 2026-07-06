type ResponseErrorParamsType = {
  description: string;
  exampleMessage: string;
  statusCode?: number;
  exampleErrors?: {
    field: string;
    message: string;
  };
};

export const responseError = ({
  description,
  exampleMessage,
  statusCode,
  exampleErrors,
}: ResponseErrorParamsType) => {
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
            ...(statusCode === 400 && {
              errors: {
                type: 'object',
                example: exampleErrors,
              },
            }),
          },
        },
      },
    },
  };
};
