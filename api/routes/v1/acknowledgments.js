import express from "express";
import { getOutgoingAcknowledgments } from "../../controllers/acknowledgment.controller.js";

const router = express.Router();

router.get("/outgoing", getOutgoingAcknowledgments);

export default router;