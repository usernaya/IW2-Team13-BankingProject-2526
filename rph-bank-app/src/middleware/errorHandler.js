import { sendFailure } from "../utils/response.js";
import { Log } from "../models/log.model.js";
import { formatDateTime } from "../utils/formatDate.js";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Internal server error";
  const data = err.data ?? null;

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  Log.createEntry({
    datetime: formatDateTime(new Date()),
    message: err.message || "Unhandled exception",
    type: "exception",
    code: err.code || "INTERNAL_ERROR",
    po_id: err.po_id || null,
  }).catch(() => {
    // Silent failure to avoid losing the original error response
  });

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return sendFailure(res, {
      status: 400,
      code: "INVALID_JSON",
      message: "Malformed JSON in request body.",
      data: null,
    });
  }

  return sendFailure(res, { status, code, message, data });
}
