import Joi from "joi";
import { validateIban } from "../validators/iban.validator.js";
import { validateBic } from "../validators/bic.validator.js";

const codeValue = Joi.alternatives().try(
  Joi.number().integer(),
  Joi.string().pattern(/^[0-9]+$/),
);

const timestampValue = Joi.string().pattern(
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
);

const acknowledgmentSchema = Joi.object({
  po_id: Joi.string().max(50).required(),
  po_amount: Joi.number().precision(2).min(0.01).required(),
  po_message: Joi.string().allow("", null).required(),
  po_datetime: timestampValue.required(),
  ob_id: Joi.string().custom(validateBic, "BIC validation").required(),
  oa_id: Joi.any().optional(),
  ob_code: Joi.any().optional(),
  ob_datetime: timestampValue.required(),
  cb_code: Joi.any().optional(),
  cb_datetime: timestampValue.required(),
  bb_id: Joi.string().custom(validateBic, "BIC validation").required(),
  ba_id: Joi.any().optional(),
  bb_code: Joi.any().optional(),
  bb_datetime: timestampValue.required(),
});

export const acknowledgmentBatchSchema = Joi.object({
  data: Joi.array().items(acknowledgmentSchema).min(1).required(),
});
