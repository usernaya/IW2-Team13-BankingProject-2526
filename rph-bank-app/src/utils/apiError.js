export class ApiError extends Error {
  constructor(
    message,
    { status = 500, code = "INTERNAL_ERROR", data = null } = {},
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}
