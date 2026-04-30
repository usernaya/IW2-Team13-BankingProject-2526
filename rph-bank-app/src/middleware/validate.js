import { sendFailure } from "../utils/response.js";

export function validate(schema, source = "body") {
  return function (req, res, next) {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return sendFailure(res, {
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        data: null,
        errors: error.details.map((d) => ({
          field: d.path.join("."),
          message: d.message,
        })),
      });
    }

    req.validated = req.validated || {};
    req.validated[source] = value;

    next();
  };
}
