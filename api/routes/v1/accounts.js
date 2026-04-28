import express from "express";
import { createNewAccount, getAllAccounts, getFromIban } from "../../controllers/accountController.js";
const router = express.Router();

router.get('/', getAllAccounts);
router.post('/', createNewAccount);
router.get('/:iban', getFromIban)

export default router;