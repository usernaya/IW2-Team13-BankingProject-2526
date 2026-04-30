import { validateIban } from "../validators/iban.validator.js";
import Joi from "joi";

export const getFromIbanSchema = Joi.object({
  iban: Joi.string().custom(validateIban, "IBAN validation").required(),
});

export const createAccountSchema = Joi.object({
  balance: Joi.number().precision(2).min(0).max(9999999999999.99).default(0),
});
