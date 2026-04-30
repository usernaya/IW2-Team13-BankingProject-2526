export function sendSuccess(
  res,
  { status = 200, code = null, message = null, data = null } = {},
) {
  return res.status(status).json({
    ok: true,
    status,
    code,
    message,
    data,
  });
}

export function sendFailure(
  res,
  {
    status = 500,
    code = "INTERNAL_ERROR",
    message = "Internal server error",
    data = null,
    errors = null,
  } = {},
) {
  const body = {
    ok: false,
    status,
    code,
    message,
    data,
  };

  if (errors) {
    body.errors = errors;
  }

  return res.status(status).json(body);
}
