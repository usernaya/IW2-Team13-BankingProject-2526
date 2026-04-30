import Joi from "joi";
import { validateIban } from "../validators/iban.validator.js";
import { validateBic } from "../validators/bic.validator.js";

export const newPaymentOrderSchema = Joi.object({
  po_amount: Joi.number().precision(2).min(0.01).max(500).required(),
  po_message: Joi.string()
    .min(5)
    .pattern(/[A-Za-z]/)
    .required(),
  oa_id: Joi.string().custom(validateIban, "IBAN validation").required(),
  ba_id: Joi.string().custom(validateIban, "IBAN validation").required(),
  bb_id: Joi.string().custom(validateBic, "BIC validation").required(),
});
