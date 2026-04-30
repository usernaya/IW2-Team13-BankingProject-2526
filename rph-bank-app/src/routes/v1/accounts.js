import express from "express";
import {
  createNewAccount,
  getAllAccounts,
  getFromIban,
} from "../../controllers/account.controller.js";
import { getFromIbanSchema, createAccountSchema } from "../../schemas/account.schemas.js";
import { validate } from "../../middleware/validate.js";

const router = express.Router();

router.get("/", getAllAccounts);
router.post("/", validate(createAccountSchema), createNewAccount);
router.get("/:iban", validate(getFromIbanSchema,"params"), getFromIban);

export default router;
