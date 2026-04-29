import express from "express";
import { getAllTransactions, getTransactionFromId } from "../../controllers/transaction.controller.js";

const router = express.Router();

router.get("/", getAllTransactions);
router.get("/:id", getTransactionFromId);

export default router;