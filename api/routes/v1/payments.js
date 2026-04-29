import express from "express";
import {
  createNewPaymentOrder,
  getAllIncomingPaymentOrders,
  getAllOutgoingPaymentOrders,
  getAllPendingPaymentOrders,
} from "../../controllers/payment.controller.js";
import { newPaymentOrderSchema } from "../../schemas/payment.schemas.js";
import { validate } from "../../middleware/validate.js";

const router = express.Router();

router.get("/outgoing", getAllOutgoingPaymentOrders);
router.get("/incoming", getAllIncomingPaymentOrders);
router.get("/pending", getAllPendingPaymentOrders);
router.post("/", validate(newPaymentOrderSchema), createNewPaymentOrder);

export default router;
