import { validateIban } from "../validators/iban.validator.js";
import Joi from "joi";

export const newPaymentOrderSchema = Joi.object({
    po_amount: Joi.number().precision(2).max(500).positive().required(),
    po_message: Joi.string().required(),
    oa_id: Joi.string().required(),
    ba_id: Joi.string().custom(validateIban, "IBAN validation").required(),
    bb_id: Joi.string().required()
});
