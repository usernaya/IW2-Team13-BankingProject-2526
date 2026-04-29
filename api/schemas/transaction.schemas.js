import Joi from "joi";

export const transactionIdSchema = Joi.object({
    id: Joi.string().required()
});