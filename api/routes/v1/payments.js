import express from "express";
import {
  createNewPaymentOrder,
  getAllIncomingPaymentOrders,
  getAllOutgoingPaymentOrders,
  getAllPendingPaymentOrders,
  sendNewPayments,
} from "../../controllers/payment.controller.js";
import { newPaymentOrderSchema } from "../../schemas/payment.schemas.js";
import { validate } from "../../middleware/validate.js";
import { handleIncomingPaymentOrders } from "../../services/cb/paymentOrderSyncService.js";

const router = express.Router();

router.get("/outgoing", getAllOutgoingPaymentOrders);
router.get("/incoming", getAllIncomingPaymentOrders);
router.get("/pending", getAllPendingPaymentOrders);
router.post("/", validate(newPaymentOrderSchema, "body"), createNewPaymentOrder);
router.post("/send", sendNewPayments);
router.post("/handle", handleIncomingPaymentOrders);

export default router;