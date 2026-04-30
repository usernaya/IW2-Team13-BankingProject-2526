import express from "express";
import {
  getAllTransactions,
  getFailedTransactions,
  getOutstandingPayments,
} from "../../controllers/transaction.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(getAllTransactions));
router.get("/failed", asyncHandler(getFailedTransactions));
router.get("/outstanding", asyncHandler(getOutstandingPayments));

export default router;
