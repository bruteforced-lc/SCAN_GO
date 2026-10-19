// Create an Error that carries an HTTP status code.
export const httpError = (status, message) =>
  Object.assign(new Error(message), { status });
