import express from "express";
import { getBanks } from "../../controllers/banks.controller.js";
import { getBanksSchema } from "../../schemas/banks.schemas.js";
import { validate } from "../../middleware/validate.js";

const router = express.Router();

router.get("/", validate(getBanksSchema, "query"), getBanks)

export default router;
