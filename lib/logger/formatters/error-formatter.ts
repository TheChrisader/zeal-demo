interface ErrorWithCode extends Error {
  code?: string;
  status?: number;
}

export function errorFormatter(error: unknown) {
  if (error instanceof Error) {
    const err = error as ErrorWithCode;
    return {
      type: 'Error',
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: err.code,
      apiErrorCode: err.code,
      apiErrorStatus: err.status,
    };
  }
  return {
    type: 'Unknown',
    message: String(error),
  };
}
