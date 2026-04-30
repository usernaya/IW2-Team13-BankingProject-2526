import express from "express";
import {
  createNewPaymentOrder,
  getAllIncomingPaymentOrders,
  getAllOutgoingPaymentOrders,
  getAllPendingPaymentOrders,
  sendNewPayments,
  handleNewPayments,
} from "../../controllers/payment.controller.js";
import { newPaymentOrderSchema } from "../../schemas/payment.schemas.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const router = express.Router();

router.get("/outgoing", asyncHandler(getAllOutgoingPaymentOrders));
router.get("/incoming", asyncHandler(getAllIncomingPaymentOrders));
router.get("/pending", asyncHandler(getAllPendingPaymentOrders));
router.post(
  "/",
  validate(newPaymentOrderSchema, "body"),
  asyncHandler(createNewPaymentOrder),
);
router.post("/send", asyncHandler(sendNewPayments));
router.post("/handle", asyncHandler(handleNewPayments));

export default router;
