export const success = (data: unknown, status = 200) => ({
  status,
  jsonBody: {
    success: true,
    data,
  },
});

export const error = (message: string, status = 500) => ({
  status,
  jsonBody: {
    success: false,
    message,
  },
});
