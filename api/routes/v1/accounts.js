import express from "express";
import {
  createNewAccount,
  getAllAccounts,
  getFromIban,
} from "../../controllers/account.controller.js";
import { getFromIbanSchema } from "../../schemas/account.schemas.js";
import { validate } from "../../middleware/validate.js";

const router = express.Router();

router.get("/", getAllAccounts);
router.post("/", createNewAccount);
router.get("/:iban", validate(getFromIbanSchema), getFromIban);

export default router;
