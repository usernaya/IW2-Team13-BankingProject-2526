import { validateIban } from "../validators/iban.validator.js";
import Joi from "joi";

export const getFromIbanSchema = Joi.object({
  iban: Joi.string().custom(validateIban, "IBAN validation").required(),
});
