import Joi from "joi";

export const getBanksSchema = Joi.object({
    refresh: Joi.bool().default(false)
});