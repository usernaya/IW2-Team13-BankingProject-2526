import express from "express";
import { getOutgoingAcknowledgments } from "../../controllers/acknowledgment.controller.js";
import { handleIncomingAcknowledgments } from "../../services/cb/acknowledgmentSyncService.js";

const router = express.Router();

router.get("/outgoing", getOutgoingAcknowledgments);
router.post("/handle", handleIncomingAcknowledgments);
export default router;