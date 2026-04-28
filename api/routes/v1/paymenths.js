import express from "express";
import { getAllIncomingPaymenthOrders, getAllOutgoingPaymenthOrders, getAllPendingPaymenthOrders } from "../../controllers/paymenthController.js";
const router = express.Router();

router.get("/outgoing", getAllOutgoingPaymenthOrders);
router.get("/incoming", getAllIncomingPaymenthOrders);
router.get("/pending", getAllPendingPaymenthOrders);

export default router;